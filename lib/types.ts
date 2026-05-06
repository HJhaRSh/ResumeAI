export type Severity = "critical" | "major" | "minor";
export type Category =
  | "format"
  | "content"
  | "keywords"
  | "structure"
  | "impact"
  | "length";

export interface ParsedResume {
  rawText: string;
  wordCount: number;
  lineCount: number;
  fileType: "pdf" | "docx";
  fileName: string;
  fileSizeKB: number;
  detectedSections: string[]; // e.g. ["education", "experience", "skills"]
  bulletPoints: string[]; // all bullet point lines extracted
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  hasGitHub: boolean;
  estimatedPageCount: number; // wordCount / 400 rounded
}

export interface ATSIssue {
  id: string;
  category: Category;
  severity: Severity;
  title: string; // short label e.g. "Missing action verbs"
  description: string; // plain English explanation
  howToFix: string; // specific instruction
  affectedText?: string; // the actual text that triggered this rule
  improvedVersion?: string; // AI-generated improved version (for bullet points)
  points: number; // how many score points fixing this recovers
}

export interface ScoreBreakdown {
  format: number; // 0–100: file format, fonts, tables, columns
  structure: number; // 0–100: sections present, ordering
  content: number; // 0–100: bullet quality, action verbs, quantification
  keywords: number; // 0–100: technical/role keywords presence
  impact: number; // 0–100: achievements vs duties, numbers used
  length: number; // 0–100: page count, word count appropriateness
}

export interface AnalysisResult {
  overallScore: number; // weighted average 0–100
  breakdown: ScoreBreakdown;
  grade: "A" | "B" | "C" | "D" | "F";
  issues: ATSIssue[];
  topThreeFixes: ATSIssue[]; // highest impact fixes
  improvedBullets: ImprovedBullet[];
  summary: string; // 2-sentence AI summary
  positives: string[]; // 2–3 things done well
  estimatedPassRate: string; // e.g. "Likely rejected by 7 out of 10 ATS systems"
  jdMatch?: {
    score: number;
    missingKeywords: string[];
    matchingKeywords: string[];
    advice?: string;
    verdict?: string; // e.g. "Likely Fit", "Not Fit", "Great Match"
  };
}

export interface ImprovedBullet {
  original: string;
  improved: string;
  whatChanged: string; // e.g. "Added action verb + quantified outcome"
}
