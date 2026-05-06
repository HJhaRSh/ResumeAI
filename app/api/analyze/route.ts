import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

import { runATSRules } from "@/lib/atsRules";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPrompt } from "@/lib/prompts";
import { buildAnalysisResultSkeleton, topFixesByPoints } from "@/lib/scoreCalculator";
import type {
  AnalysisResult,
  ImprovedBullet,
  ParsedResume,
} from "@/lib/types";

export const runtime = "nodejs";

type ClaudeMiniJson = {
  summary?: unknown;
  positives?: unknown;
  improvedBullets?: unknown;
  jdMatch?: {
    score?: number | string;
    missingKeywords?: string[];
    matchingKeywords?: string[];
    advice?: string;
  };
};

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function isImprovedBullets(v: unknown): v is ImprovedBullet[] {
  if (!Array.isArray(v)) return false;
  return v.every((item) => {
    if (!item || typeof item !== "object") return false;
    const o = item as Record<string, unknown>;
    return (
      typeof o.original === "string" &&
      typeof o.improved === "string" &&
      typeof o.whatChanged === "string"
    );
  });
}

function safeJsonExtract(text: string): ClaudeMiniJson | null {
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(unfenced) as ClaudeMiniJson;
  } catch {
    const start = unfenced.indexOf("{");
    const end = unfenced.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(unfenced.slice(start, end + 1)) as ClaudeMiniJson;
    } catch {
      return null;
    }
  }
}

function buildIssuesSummary(issues: ReturnType<typeof runATSRules>): string {
  return topFixesByPoints(issues, 5)
    .map((i) => `- ${i.title}`)
    .join("\n");
}

function getDeterministicJdMatch(jd: string, parsed: ParsedResume) {
  const jdLower = jd.toLowerCase();
  const resumeLower = parsed.rawText.toLowerCase();
  const missingJdKeywords: string[] = [];
  const matchingJdKeywords: string[] = [];

  const fallbackTech = ["python", "java", "javascript", "typescript", "c++", "c#", "sql", "html", "css", "r", "go", "kotlin", "swift", "php", "react", "angular", "vue", "node", "django", "flask", "spring", "express", "nextjs", "fastapi", "git", "github", "docker", "kubernetes", "aws", "azure", "gcp", "linux", "figma", "postman", "jira", "tableau", "machine learning", "deep learning", "data structures", "algorithms", "api", "rest", "agile", "ci/cd", "oops"];

  for (const k of fallbackTech) {
    const isMulti = k.includes(" ");
    const matchJd = isMulti ? jdLower.includes(k) : new RegExp(`\\b${k.replace(/[+]/g, "\\+")}\\b`, "i").test(jdLower);
    if (matchJd) {
      const matchRes = isMulti ? resumeLower.includes(k) : new RegExp(`\\b${k.replace(/[+]/g, "\\+")}\\b`, "i").test(resumeLower);
      if (matchRes) matchingJdKeywords.push(k);
      else missingJdKeywords.push(k);
    }
  }

  const total = missingJdKeywords.length + matchingJdKeywords.length;
  const score = total > 0 ? Math.round((matchingJdKeywords.length / total) * 100) : 100;

  return {
    score,
    missingKeywords: missingJdKeywords,
    matchingKeywords: matchingJdKeywords,
    advice: `Your resume matches ${matchingJdKeywords.length} key technical skills from the job description, but is missing ${missingJdKeywords.length} important terms. Consider expanding your bullet points or skills section to incorporate the missing keywords to improve your ATS ranking.`,
  };
}

function fallbackAiCopy(parsed: ParsedResume): {
  summary: string;
  positives: string[];
  improvedBullets: ImprovedBullet[];
} {
  const wordCountHint =
    parsed.wordCount < 260
      ? "It reads a touch thin compared to typical fresher profiles."
      : "It carries enough breadth to tighten into a sharper one-page storyline.";

  return {
    summary: `We scored this resume deterministically across ATS-aligned categories for Indian fresher hiring. ${wordCountHint} AI rewriting is unavailable right now, so bullet upgrades are omitted.`,
    positives: [],
    improvedBullets: [],
  };
}

function blendJdScore(skeleton: AnalysisResult, jdMatchData?: AnalysisResult["jdMatch"]) {
  if (!jdMatchData) return skeleton;

  const combined = Math.round((skeleton.overallScore + Number(jdMatchData.score)) / 2);
  skeleton.overallScore = combined;

  // Calculate verdict
  const jdScore = Number(jdMatchData.score);
  if (jdScore >= 85) jdMatchData.verdict = "Excellent Match";
  else if (jdScore >= 70) jdMatchData.verdict = "Good Fit";
  else if (jdScore >= 50) jdMatchData.verdict = "Potential Fit";
  else jdMatchData.verdict = "Not a Fit for this Job";

  if (combined >= 90) {
    skeleton.grade = "A";
    skeleton.estimatedPassRate = "Likely passes 9 out of 10 ATS systems";
  } else if (combined >= 75) {
    skeleton.grade = "B";
    skeleton.estimatedPassRate = "Likely passes 7 out of 10 ATS systems";
  } else if (combined >= 60) {
    skeleton.grade = "C";
    skeleton.estimatedPassRate = "Likely passes 5 out of 10 ATS systems";
  } else if (combined >= 45) {
    skeleton.grade = "D";
    skeleton.estimatedPassRate = "Likely rejected by 6 out of 10 ATS systems";
  } else {
    skeleton.grade = "F";
    skeleton.estimatedPassRate = "Likely rejected by 9 out of 10 ATS systems";
  }

  // If JD Match is very low, override summary to be more blunt
  if (jdScore < 50) {
    skeleton.summary = `CRITICAL: Your resume is not a fit for this specific job description. It misses too many core technical requirements and will likely be filtered out immediately by the ATS.`;
  }

  return skeleton;
}

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as Partial<{ parsed: ParsedResume; jobDescription?: string }>;
    if (!json?.parsed || typeof json.parsed.rawText !== "string") {
      return NextResponse.json(
        {
          error: "Invalid request body.",
          details: 'Expected JSON: { "parsed": ParsedResume }',
        },
        { status: 400 },
      );
    }

    const parsed = json.parsed;
    const jd = typeof json.jobDescription === "string" ? json.jobDescription.trim() : undefined;
    const issues = runATSRules(parsed);

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    console.log("API Key present:", !!apiKey);
    if (!apiKey) {
      console.warn("Missing GEMINI_API_KEY");
      const fb = fallbackAiCopy(parsed);
      const jdMatchData = jd ? getDeterministicJdMatch(jd, parsed) : undefined;
      
      if (jdMatchData && jdMatchData.missingKeywords.length > 0) {
        issues.push({
          id: "K3",
          category: "keywords",
          severity: jdMatchData.missingKeywords.length >= 3 ? "critical" : "major",
          title: "Missing Job Description Keywords",
          description: `You are missing important hard skills found in the job description you provided. Your JD Match Score is ${jdMatchData.score}%.`,
          howToFix: `Add these keywords naturally to your experience or skills section: ${jdMatchData.missingKeywords.slice(0, 8).join(", ")}.`,
          points: 15,
        });
      }

      const skeleton = buildAnalysisResultSkeleton(issues, {
        summary: fb.summary,
        positives: fb.positives,
        improvedBullets: fb.improvedBullets,
      });

      const blended = blendJdScore(skeleton, jdMatchData);

      const analysis: AnalysisResult = {
        ...blended,
        jdMatch: jdMatchData,
      };

      return NextResponse.json({
        ...analysis,
        notice:
          "AI suggestions unavailable right now — showing rule-based analysis only.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const userPrompt = buildAnalysisUserPrompt({
      rawText: parsed.rawText,
      topIssuesSummary: buildIssuesSummary(issues),
      jobDescription: jd,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    let textOut = "";
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 1200,
        },
      });

      textOut = result.response.text();
    } catch (err) {
      console.error("AI Analysis Error Detail:", err);
      const fb = fallbackAiCopy(parsed);
      const jdMatchData = jd ? getDeterministicJdMatch(jd, parsed) : undefined;
      
      if (jdMatchData && jdMatchData.missingKeywords.length > 0) {
        issues.push({
          id: "K3",
          category: "keywords",
          severity: jdMatchData.missingKeywords.length >= 3 ? "critical" : "major",
          title: "Missing Job Description Keywords",
          description: `You are missing important hard skills found in the job description you provided. Your JD Match Score is ${jdMatchData.score}%.`,
          howToFix: `Add these keywords naturally to your experience or skills section: ${jdMatchData.missingKeywords.slice(0, 8).join(", ")}.`,
          points: 15,
        });
      }

      const skeleton = buildAnalysisResultSkeleton(issues, {
        summary: fb.summary,
        positives: fb.positives,
        improvedBullets: fb.improvedBullets,
      });

      const blended = blendJdScore(skeleton, jdMatchData);

      const analysis: AnalysisResult = {
        ...blended,
        jdMatch: jdMatchData,
      };

      return NextResponse.json({
        ...analysis,
        notice:
          "AI suggestions unavailable right now — showing rule-based analysis only.",
      });
    } finally {
      clearTimeout(timeout);
    }

    const parsedJson = safeJsonExtract(textOut);

    const summary =
      typeof parsedJson?.summary === "string" && parsedJson.summary.trim()
        ? parsedJson.summary.trim()
        : fallbackAiCopy(parsed).summary;

    const positives =
      isStringArray(parsedJson?.positives) && parsedJson.positives.length
        ? parsedJson.positives.slice(0, 5)
        : [];

    const improvedBullets =
      isImprovedBullets(parsedJson?.improvedBullets) &&
      parsedJson.improvedBullets.length
        ? parsedJson.improvedBullets.slice(0, 8)
        : [];

    let jdMatchData: AnalysisResult["jdMatch"] = undefined;
    if (parsedJson?.jdMatch) {
      const rawScore = parsedJson.jdMatch.score;
      let numericScore = 0;
      if (typeof rawScore === "number") {
        numericScore = rawScore;
      } else if (typeof rawScore === "string") {
        numericScore = parseInt(rawScore.replace(/[^0-9]/g, ""), 10) || 0;
      }

      jdMatchData = {
        score: numericScore,
        missingKeywords: Array.isArray(parsedJson.jdMatch.missingKeywords) ? parsedJson.jdMatch.missingKeywords : [],
        matchingKeywords: Array.isArray(parsedJson.jdMatch.matchingKeywords) ? parsedJson.jdMatch.matchingKeywords : [],
        advice: typeof parsedJson.jdMatch.advice === "string" ? parsedJson.jdMatch.advice : undefined,
      };

      // Always show the JD Match component if JD was provided, even if missingKeywords is empty
      if (jdMatchData.missingKeywords.length > 0) {
        issues.push({
          id: "K3",
          category: "keywords",
          severity: jdMatchData.missingKeywords.length >= 3 ? "critical" : "major",
          title: "Missing Job Description Keywords",
          description: `The AI analysis detected that you are missing important hard skills found in the job description you provided. Your JD Match Score is ${jdMatchData.score}%.`,
          howToFix: `Add these keywords naturally to your experience or skills section: ${jdMatchData.missingKeywords.join(", ")}.`,
          points: 15,
        });
      }
    } else if (jd) {
      // Fallback deterministic JD matcher if AI fails to return jdMatch but jd was provided
      jdMatchData = getDeterministicJdMatch(jd, parsed);

      if (jdMatchData.missingKeywords.length > 0) {
        issues.push({
          id: "K3",
          category: "keywords",
          severity: jdMatchData.missingKeywords.length >= 3 ? "critical" : "major",
          title: "Missing Job Description Keywords",
          description: `You are missing important hard skills found in the job description you provided. Your JD Match Score is ${jdMatchData.score}%.`,
          howToFix: `Add these keywords naturally to your experience or skills section: ${jdMatchData.missingKeywords.slice(0, 8).join(", ")}.`,
          points: 15,
        });
      }
    }

    const skeleton = buildAnalysisResultSkeleton(issues, {
      summary,
      positives,
      improvedBullets,
    });

    const blended = blendJdScore(skeleton, jdMatchData);

    const analysis: AnalysisResult = {
      ...blended,
      jdMatch: jdMatchData,
    };

    return NextResponse.json({ ...analysis });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Analysis failed.",
        details: String(err instanceof Error ? err.message : err),
      },
      { status: 500 },
    );
  }
}
