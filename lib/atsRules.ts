import type { ATSIssue, Category, ParsedResume, Severity } from "./types";

function issue(
  id: string,
  category: Category,
  severity: Severity,
  title: string,
  description: string,
  howToFix: string,
  points: number,
  extras?: Partial<Pick<ATSIssue, "affectedText" | "improvedVersion">>,
): ATSIssue {
  return {
    id,
    category,
    severity,
    title,
    description,
    howToFix,
    points,
    ...(extras ?? {}),
  };
}

const WEAK_OPENERS = [
  "Responsible for",
  "Worked on",
  "Helped",
  "Assisted",
  "Was part of",
  "Did",
  "Made",
  "Used",
  "Involved in",
  "Part of",
  "Contributed to",
] as const;

const BUZZWORDS = [
  "passionate",
  "hardworking",
  "team player",
  "go-getter",
  "self-starter",
  "dynamic",
  "synergy",
  "leverage",
  "proactive",
  "detail-oriented",
  "fast learner",
] as const;

const TECH_KEYWORDS = [
  "python",
  "java",
  "javascript",
  "typescript",
  "c++",
  "c#",
  "sql",
  "html",
  "css",
  "r",
  "go",
  "kotlin",
  "swift",
  "php",
  "react",
  "angular",
  "vue",
  "node",
  "django",
  "flask",
  "spring",
  "express",
  "nextjs",
  "fastapi",
  "git",
  "github",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "linux",
  "figma",
  "postman",
  "jira",
  "tableau",
  "machine learning",
  "deep learning",
  "data structures",
  "algorithms",
  "api",
  "rest",
  "agile",
  "ci/cd",
  "oops",
] as const;

const QUANT_RE =
  /\d+(\.\d+)?(%|users|ms|seconds|hours|days|weeks|months|years|x|times|K|L|cr|lakh|crore)/i;


const DUTY_PATTERNS = [
  /was responsible for/i,
  /duties included/i,
  /helped the team/i,
];

function linesOf(text: string): string[] {
  return text.split(/\r?\n/);
}

function stripMdNoise(text: string): string {
  return text.replace(/\u00a0/g, " ");
}

function looksLikeTableOrPipes(rawText: string): boolean {
  const ls = linesOf(rawText);
  return ls.some((l) => {
    const pipes = l.match(/\|/g)?.length ?? 0;
    const tabs = l.match(/\t/g)?.length ?? 0;
    return pipes >= 4 || tabs >= 3;
  });
}

function looksLikeMultiColumn(rawText: string): boolean {
  return linesOf(rawText).some((line) => {
    if (line.length < 40) return false;
    if (line.includes("\t")) return true;
    // wide gap between two substantial chunks (common in 2-column templates)
    return /.{20,}\s{3,}.{20,}/.test(line);
  });
}

function getBulletFirstToken(line: string): string {
  const trimmed = line.trim();
  const withoutBullet = trimmed.replace(
    /^(\u2022|•|\*|[-–—]|\u25cf|\u25aa|\u25cb|▪|◦|·|➤|✓|★|●)\s+/u,
    "",
  );
  return withoutBullet.trim();
}

function lineUsesNonStandardBullet(line: string): boolean {
  const t = line.trimStart();
  if (!t) return false;
  // standard: '-' or '*' at line start (optionally after whitespace)
  if (/^(\*|-)\s+/.test(t)) return false;
  // other common ascii bullet markers we still treat as non-standard for ATS safety
  if (/^(•|·|▪|◦)\s+/.test(t)) return true;
  // unicode / symbol bullets
  if (/^[^\w(]/.test(t) && /[A-Za-z]/.test(t)) {
    const first = t[0] ?? "";
    if (first === "*" || first === "-") return false;
    // any other leading punctuation/symbol before letters
    if (/^[\p{P}\p{S}]/u.test(first)) return true;
  }
  return false;
}

function firstAndLastNonEmptyLines(text: string): { first: string; last: string } | null {
  const ls = linesOf(text).map((l) => l.trim()).filter(Boolean);
  if (ls.length < 2) return null;
  return { first: ls[0]!, last: ls[ls.length - 1]! };
}

function weakOpenerHits(bullet: string): boolean {
  const cleaned = getBulletFirstToken(bullet);
  const head = cleaned.slice(0, 80).toLowerCase();
  return WEAK_OPENERS.some((w) => head.startsWith(w.toLowerCase()));
}

function bulletHasQuant(bullet: string): boolean {
  return QUANT_RE.test(bullet) || /\d/.test(bullet);
}

function buzzwordCount(rawText: string): number {
  const lower = rawText.toLowerCase();
  let n = 0;
  for (const b of BUZZWORDS) {
    const re = new RegExp(`\\b${b.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "gi");
    const m = lower.match(re);
    n += m?.length ?? 0;
  }
  return n;
}

function educationWindow(rawText: string): string {
  const lowerLines = linesOf(rawText).map((l) => l.trim());
  const idx = lowerLines.findIndex((l) => /^(education|academic profile)\s*:?$/i.test(l));
  if (idx === -1) return "";
  const chunk = lowerLines.slice(idx, idx + 18).join("\n");
  return chunk.toLowerCase();
}

function extractSectionSlice(rawText: string, headings: RegExp): string | null {
  const ls = linesOf(rawText);
  const lower = ls.map((l) => l.trim().toLowerCase().replace(/:\s*$/, ""));
  const keyLines = [
    "education",
    "experience",
    "work experience",
    "internship",
    "internships",
    "projects",
    "skills",
    "technical skills",
    "certifications",
    "achievements",
    "awards",
    "summary",
    "objective",
    "extra-curricular",
    "activities",
    "publications",
    "hobbies",
  ];
  const isAnyHeading = (l: string) =>
    keyLines.includes(l) ||
    /^(work experience|technical skills|extra-curricular)$/i.test(l);

  let start = -1;
  for (let i = 0; i < lower.length; i++) {
    const l = lower[i] ?? "";
    if (headings.test(l)) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;

  let end = ls.length;
  for (let j = start + 1; j < lower.length; j++) {
    const l = lower[j] ?? "";
    if (isAnyHeading(l)) {
      end = j;
      break;
    }
  }
  return ls.slice(start, end).join("\n");
}

function countDatePatterns(text: string): number {
  const re =
    /\b((jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4})|(\d{1,2}\/\d{4})|(\b\d{4}-\d{2}\b)/gi;
  return [...text.matchAll(re)].length;
}

function countProjectTitles(rawText: string): number {
  const slice = extractSectionSlice(rawText, /^(projects?)$/i);
  if (!slice) return 0;
  const ls = linesOf(slice);
  let titles = 0;
  for (const line of ls) {
    const t = line.trim();
    if (!t) continue;
    if (/^(projects?)\s*:?$/i.test(t)) continue;
    if (/^\s*([-*•·▪◦]|\d+\.)\s+/.test(t)) continue;
    if (t.length >= 4 && t.length <= 120) titles += 1;
  }
  return titles;
}

function summaryOrObjectiveFirstSection(detected: string[]): boolean {
  const first = detected[0];
  return first === "summary" || first === "objective";
}

function objectiveLineCount(rawText: string): number {
  const slice =
    extractSectionSlice(rawText, /^(summary|objective)\s*:?$/i) ??
    // fall back: if first heading is summary/objective, slice still works
    null;
  if (!slice) return 0;
  const body = linesOf(slice)
    .slice(1) // drop heading line
    .map((l) => l.trim())
    .filter(Boolean);
  return body.length;
}

function countTechKeywords(rawText: string): number {
  const lower = rawText.toLowerCase();
  let hits = 0;
  for (const k of TECH_KEYWORDS) {
    if (k.includes(" ")) {
      if (lower.includes(k)) hits += 1;
      continue;
    }
    const re = new RegExp(`\\b${k.replace(/[+]/g, "\\+")}\\b`, "i");
    if (re.test(lower)) hits += 1;
  }
  return hits;
}

function skillsLooksLikeParagraph(rawText: string, detected: string[]): boolean {
  if (!detected.includes("skills")) return false;
  const slice =
    extractSectionSlice(rawText, /^(technical skills|skills)\s*:?$/i) ??
    extractSectionSlice(rawText, /^skills\s*:?$/i);
  if (!slice) return false;
  const body = linesOf(slice)
    .slice(1)
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
  if (!body) return false;
  const singleLine = !body.includes("\n");
  const veryLong = body.length > 180;
  const commaHeavy = (body.match(/,/g)?.length ?? 0) >= 6;
  return singleLine && (veryLong || commaHeavy);
}

function dutyListingSignals(rawText: string): boolean {
  return DUTY_PATTERNS.some((re) => re.test(rawText));
}

export function runATSRules(parsed: ParsedResume): ATSIssue[] {
  const rawText = stripMdNoise(parsed.rawText);
  const issues: ATSIssue[] = [];

  // ── FORMAT ──
  if (looksLikeTableOrPipes(rawText)) {
    issues.push(
      issue(
        "F1",
        "format",
        "critical",
        "Tables detected",
        "Many ATS parsers read tables poorly, which can scramble skills, dates, or education into unreadable blobs.",
        "Replace all tables with plain text lists. Use spacing and caps for alignment instead.",
        15,
      ),
    );
  }

  if (looksLikeMultiColumn(rawText)) {
    issues.push(
      issue(
        "F2",
        "format",
        "critical",
        "Multi-column layout detected",
        "ATS tools often concatenate columns left-to-right, mixing unrelated content together.",
        "Switch to a single-column layout. Two-column resumes are ATS killers.",
        15,
      ),
    );
  }

  if (linesOf(rawText).some((l) => lineUsesNonStandardBullet(l))) {
    issues.push(
      issue(
        "F3",
        "format",
        "major",
        "Non-standard bullet symbols",
        "Some ATS systems mishandle uncommon bullet glyphs, which can break line parsing.",
        "Use standard hyphens (-) or asterisks (*) for bullet points.",
        8,
      ),
    );
  }

  const boundary = firstAndLastNonEmptyLines(rawText);
  if (boundary) {
    const a = boundary.first.trim();
    const b = boundary.last.trim();
    const isShortRepeated = a.length >= 8 && a.length <= 70 && a.toLowerCase() === b.toLowerCase();
    if (isShortRepeated) {
      issues.push(
        issue(
          "F4",
          "format",
          "minor",
          "Possible header/footer duplication",
          "Repeated header/footer lines can confuse parsers or cause content to appear twice.",
          "Remove headers and footers. Put your name and contact info in the main body.",
          5,
          { affectedText: a },
        ),
      );
    }
  }

  if (parsed.fileSizeKB > 100 && rawText.length < 100) {
    issues.push(
      issue(
        "F5",
        "format",
        "minor",
        "Very little selectable text extracted",
        "Large file size with tiny extracted text usually means scanned pages or embedded images — ATS reads almost nothing.",
        "Re-export your resume as a text-based PDF from Word or Google Docs.",
        5,
      ),
    );
  }

  // ── STRUCTURE ──
  if (!parsed.hasEmail || !parsed.hasPhone) {
    issues.push(
      issue(
        "S1",
        "structure",
        "critical",
        "Missing contact details",
        "Most ATS pipelines require at minimum an email and phone number to validate and route applications.",
        "Add your email and phone number at the very top of the resume.",
        15,
      ),
    );
  }

  if (!parsed.hasLinkedIn) {
    issues.push(
      issue(
        "S2",
        "structure",
        "major",
        "No LinkedIn URL",
        "Recruiters and many ATS integrations look for LinkedIn for identity verification.",
        "Add your LinkedIn profile URL. Most ATS systems and recruiters check this.",
        10,
      ),
    );
  }

  if (!parsed.detectedSections.includes("skills")) {
    issues.push(
      issue(
        "S3",
        "structure",
        "major",
        "Missing Skills section",
        "A dedicated skills block is where ATS keyword matching succeeds for freshers.",
        "Add a dedicated Skills section listing your technical tools and languages.",
        8,
      ),
    );
  }

  if (!parsed.detectedSections.includes("education")) {
    issues.push(
      issue(
        "S4",
        "structure",
        "major",
        "Missing Education section",
        "Fresh hires are screened heavily on institution, branch, graduation year, and marks.",
        "Add an Education section with your degree, college, and graduation year.",
        8,
      ),
    );
  }

  if (!parsed.hasGitHub) {
    issues.push(
      issue(
        "S5",
        "structure",
        "minor",
        "No GitHub / portfolio link",
        "Projects are how freshers prove ability — ATS and recruiters frequently click GitHub.",
        "Add your GitHub profile URL — especially important for tech roles.",
        5,
      ),
    );
  }

  if (summaryOrObjectiveFirstSection(parsed.detectedSections)) {
    const lines = objectiveLineCount(rawText);
    if (lines > 3) {
      issues.push(
        issue(
          "S6",
          "structure",
          "minor",
          "Long Objective/Summary at the top",
          "Dense objectives push high-signal skills and education farther down parsing windows.",
          "Keep summary under 2 lines or remove it. Lead with Education or Skills instead for freshers.",
          4,
        ),
      );
    }
  }

  // ── CONTENT ──
  const bullets = parsed.bulletPoints;
  if (bullets.length > 0) {
    const weak = bullets.filter(weakOpenerHits).length;
    const ratio = weak / bullets.length;
    if (ratio > 0.5) {
      issues.push(
        issue(
          "C1",
          "content",
          "critical",
          "Bullets rely on weak openers",
          "Most bullets read like passive duty statements instead of strong outcomes-led lines.",
          "Start every bullet with a strong past-tense action verb: Built, Developed, Designed, Implemented, Optimised, Led, Created, Reduced, Increased.",
          20,
        ),
      );
    } else if (ratio >= 0.25) {
      issues.push(
        issue(
          "C1",
          "content",
          "major",
          "Many bullets rely on weak openers",
          "Several bullets sound passive, which lowers perceived impact versus strong action-led writing.",
          "Start every bullet with a strong past-tense action verb: Built, Developed, Designed, Implemented, Optimised, Led, Created, Reduced, Increased.",
          12,
        ),
      );
    }

    const withQuant = bullets.filter(bulletHasQuant).length;
    const qRatio = withQuant / bullets.length;
    if (withQuant === 0) {
      issues.push(
        issue(
          "C2",
          "content",
          "critical",
          "No quantification in bullets",
          "Achievement bullets without measurable signals read generic and weaker in ATS + human review.",
          "Add numbers to at least 3 bullets. Examples: 'Reduced load time by 40%', 'Built API serving 500+ users', 'Completed in 2 weeks ahead of deadline'.",
          18,
        ),
      );
    } else if (qRatio < 0.3) {
      issues.push(
        issue(
          "C2",
          "content",
          "major",
          "Low quantification density",
          "Only a minority of bullets show measurable outcomes, which lowers impact scoring.",
          "Add numbers to at least 3 bullets. Examples: 'Reduced load time by 40%', 'Built API serving 500+ users', 'Completed in 2 weeks ahead of deadline'.",
          12,
        ),
      );
    }
  }

  const buzz = buzzwordCount(rawText);
  if (buzz >= 3) {
    issues.push(
      issue(
        "C3",
        "content",
        "major",
        "Generic buzzword stuffing",
        "Buzzwords substitute for proof; many ATS parsers still ingest them poorly when repeated.",
        "Remove generic adjectives. Replace with specific achievements that demonstrate the quality instead.",
        10,
      ),
    );
  }

  const eduHit = extractSectionSlice(rawText, /^education\s*:?$/i);
  if (parsed.detectedSections.includes("education")) {
    const eduText = eduHit ?? educationWindow(rawText);
    const hasMarks =
      /\b(cgpa|gpa)\b/i.test(eduText) ||
      /\bpercentage\b/i.test(rawText) ||
      /(\d+\.\d+)\s*%/.test(rawText) ||
      /\b%\b/.test(eduText);
    if (!hasMarks) {
      issues.push(
        issue(
          "C4",
          "content",
          "minor",
          "Marks/CGPA not clearly mentioned",
          "Indian campus hiring pipelines often explicitly filter using CGPA/percentage signals.",
          "Add your CGPA or percentage if it's above 7.0 / 70%. Recruiters look for this.",
          5,
        ),
      );
    }
  }

  const hasXpOrProj =
    parsed.detectedSections.includes("experience") ||
    parsed.detectedSections.includes("internship") ||
    parsed.detectedSections.includes("projects");

  if (hasXpOrProj && countDatePatterns(rawText) < 2) {
    issues.push(
      issue(
        "C5",
        "content",
        "minor",
        "Dates missing from experience/projects",
        "Dates help ATS validate tenure and recruiters scan timelines quickly.",
        "Add start and end dates to all experience and project entries.",
        4,
      ),
    );
  }

  // ── KEYWORDS ──
  const techHits = countTechKeywords(rawText);
  if (techHits < 5) {
    issues.push(
      issue(
        "K1",
        "keywords",
        "major",
        "Too few technical keywords",
        "ATS filters heavily on language/framework/tool mentions for fresher roles.",
        "Add a Skills section listing every tool, language, and framework you know. ATS filters by keywords.",
        12,
      ),
    );
  }

  if (skillsLooksLikeParagraph(rawText, parsed.detectedSections)) {
    issues.push(
      issue(
        "K2",
        "keywords",
        "minor",
        "Skills formatted as one dense block",
        "Dense paragraphs are harder for ATS to tokenise into individual skills entities.",
        "Format skills as a clean comma-separated list or grouped by category (Languages, Frameworks, Tools).",
        6,
      ),
    );
  }

  // ── IMPACT ──
  const projTitles = countProjectTitles(rawText);
  if (!parsed.detectedSections.includes("projects") || projTitles < 2) {
    issues.push(
      issue(
        "I1",
        "impact",
        "major",
        "Projects missing or too thin",
        "Fresh candidates are evaluated primarily on internships and personal/academic builds.",
        "Add at least 2–3 personal or academic projects with tech stack used, what you built, and impact.",
        12,
      ),
    );
  }

  if (dutyListingSignals(rawText)) {
    issues.push(
      issue(
        "I2",
        "impact",
        "major",
        "Duty-focused language detected",
        "Phrasing like responsibilities and vague help-lines reads like a checklist, not accomplishments.",
        "Rewrite using the STAR format: what you did, with what tech, and what was the result.",
        10,
      ),
    );
  }

  const extra = parsed.detectedSections.some((s) =>
    ["certifications", "courses", "achievements", "activities", "awards"].includes(s),
  );
  if (!extra) {
    issues.push(
      issue(
        "I3",
        "impact",
        "minor",
        "No certifications / extras section",
        "Extra sections add credibility signals when experience is limited.",
        "Add any Coursera/Udemy certifications, hackathon participations, or college positions held.",
        5,
      ),
    );
  }

  // ── LENGTH ──
  if (parsed.estimatedPageCount > 1.2) {
    issues.push(
      issue(
        "L1",
        "length",
        "major",
        "Resume reads longer than one page",
        "For freshers, one tight page converts better across most ATS and recruiter scans.",
        "Freshers should have a 1-page resume. Remove older school achievements, cut weak bullet points, tighten descriptions.",
        10,
      ),
    );
  }

  if (parsed.wordCount < 300) {
    issues.push(
      issue(
        "L2",
        "length",
        "minor",
        "Resume feels too sparse",
        "Thin resumes may miss ATS keyword coverage and undersell achievements.",
        "Your resume is too thin. Expand project descriptions, add more bullets per role, add a skills section.",
        5,
      ),
    );
  }

  return issues;
}
