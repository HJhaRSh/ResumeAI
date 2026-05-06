import type { ATSIssue, AnalysisResult, ScoreBreakdown } from "./types";

const severityRank: Record<ATSIssue["severity"], number> = {
  critical: 0,
  major: 1,
  minor: 2,
};

export const GRADE_DESCRIPTOR: Record<AnalysisResult["grade"], string> = {
  A: "ATS-ready",
  B: "Good, minor fixes needed",
  C: "Needs work before applying",
  D: "Major issues — fix before sending",
  F: "Will be rejected by most ATS systems",
};

function clamp0(n: number): number {
  return Math.max(0, n);
}

export function computeBreakdownFromIssues(issues: ATSIssue[]): ScoreBreakdown {
  const b = {
    format: 100,
    structure: 100,
    content: 100,
    keywords: 100,
    impact: 100,
    length: 100,
  } satisfies ScoreBreakdown;

  for (const issue of issues) {
    b[issue.category] -= issue.points;
  }

  return {
    format: clamp0(b.format),
    structure: clamp0(b.structure),
    content: clamp0(b.content),
    keywords: clamp0(b.keywords),
    impact: clamp0(b.impact),
    length: clamp0(b.length),
  };
}

export function computeOverallScore(breakdown: ScoreBreakdown): number {
  return Math.round(
    breakdown.format * 0.2 +
      breakdown.structure * 0.2 +
      breakdown.content * 0.25 +
      breakdown.keywords * 0.15 +
      breakdown.impact * 0.15 +
      breakdown.length * 0.05,
  );
}

export function gradeLetter(overallScore: number): AnalysisResult["grade"] {
  if (overallScore >= 90) return "A";
  if (overallScore >= 75) return "B";
  if (overallScore >= 60) return "C";
  if (overallScore >= 45) return "D";
  return "F";
}

export function estimatedPassRate(overallScore: number): string {
  if (overallScore >= 90) return "Likely passes 9 out of 10 ATS systems";
  if (overallScore >= 75) return "Likely passes 7 out of 10 ATS systems";
  if (overallScore >= 60) return "Likely passes 5 out of 10 ATS systems";
  if (overallScore >= 45) return "Likely rejected by 6 out of 10 ATS systems";
  return "Likely rejected by 9 out of 10 ATS systems";
}

export function sortIssuesForDisplay(issues: ATSIssue[]): ATSIssue[] {
  return [...issues].sort((a, b) => {
    const s = severityRank[a.severity] - severityRank[b.severity];
    if (s !== 0) return s;
    if (b.points !== a.points) return b.points - a.points;
    return a.title.localeCompare(b.title);
  });
}

export function topFixesByPoints(issues: ATSIssue[], n: number): ATSIssue[] {
  return [...issues].sort((a, b) => b.points - a.points).slice(0, n);
}

export function buildAnalysisResultSkeleton(
  issues: ATSIssue[],
  extras?: Partial<
    Pick<AnalysisResult, "summary" | "positives" | "improvedBullets">
  >,
): AnalysisResult {
  const breakdown = computeBreakdownFromIssues(issues);
  const overallScore = computeOverallScore(breakdown);
  const grade = gradeLetter(overallScore);

  const sortedIssues = sortIssuesForDisplay(issues);

  return {
    overallScore,
    breakdown,
    grade,
    issues: sortedIssues,
    topThreeFixes: topFixesByPoints(issues, 3),
    improvedBullets: extras?.improvedBullets ?? [],
    summary:
      extras?.summary ??
      "This resume was scored using deterministic ATS rules tuned for fresher resumes. Stronger wording and tighter structure will improve readability for both ATS parsers and recruiters.",
    positives:
      extras?.positives ??
      [],
    estimatedPassRate: estimatedPassRate(overallScore),
  };
}
