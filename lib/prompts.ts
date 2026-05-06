export function buildAnalysisUserPrompt(input: {
  rawText: string;
  topIssuesSummary: string;
  jobDescription?: string;
}): string {
  return [
    "Here is a resume text extracted from a fresher's resume. Analyse it and return ONLY a JSON object with this exact structure — no preamble, no markdown, no explanation:",
    "",
    "{",
    '  "summary": "2-sentence overall assessment of resume quality and ATS readiness",',
    '  "positives": ["specific thing done well", "another positive"],',
    '  "improvedBullets": [',
    "    {",
    '      "original": "exact original bullet text",',
    '      "improved": "rewritten version with action verb + quantification",',
    '      "whatChanged": "one sentence explaining what was improved"',
    "    }",
    "  ]" + (input.jobDescription ? "," : ""),
    ...(input.jobDescription
      ? [
          '  "jdMatch": {',
          '    "score": 85,',
          '    "missingKeywords": ["hard skill 1", "concept 2"],',
          '    "matchingKeywords": ["skill 1", "tool 2"],',
          '    "advice": "Detailed strategic advice explaining how the resume fits the JD, highlighting specific gaps in experience or emphasis, and suggesting exactly how to frame the existing experience to better match the role requirements (2-3 sentences)."',
          "  }"
        ]
      : []),
    "}",
    "",
    "Rules for improved bullets:",
    "- Pick the 3–5 weakest bullets from the resume (those starting with weak verbs or lacking numbers)",
    "- Rewrite them following this formula: [Strong action verb] + [what you built/did] + [technology used] + [measurable outcome]",
    "- If no real metric exists, suggest a plausible one with a note like '(add your actual number)'",
    "- Keep the same meaning — do not invent new experiences",
    "- Do NOT rewrite bullets that are already strong",
    "",
    "Resume text:",
    "---",
    input.rawText,
    "---",
    ...(input.jobDescription
      ? [
          "",
          "Job Description to match against:",
          "---",
          input.jobDescription,
          "---",
        ]
      : []),
    "",
    "Detected issues to focus on:",
    input.topIssuesSummary,
  ].join("\n");
}

export const ANALYSIS_SYSTEM_PROMPT =
  "You are an expert resume reviewer and ATS specialist helping Indian engineering and tech freshers improve their resumes. You give direct, specific, actionable feedback — not generic advice.";
