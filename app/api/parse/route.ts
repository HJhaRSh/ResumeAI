import mammoth from "mammoth";
import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";

import { getExtension, RESUME_MAX_BYTES } from "@/lib/fileHelpers";
import type { ParsedResume } from "@/lib/types";

export const runtime = "nodejs";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function normalizeHeading(line: string): string {
  return line.trim().replace(/:+\s*$/u, "").trim().toLowerCase();
}

function sectionKey(line: string): string | null {
  const raw = normalizeHeading(line);
  if (!raw || raw.includes("\t")) return null;

  switch (raw) {
    case "education":
      return "education";
    case "experience":
    case "work experience":
      return "experience";
    case "internship":
    case "internships":
      return "internship";
    case "project":
    case "projects":
      return "projects";
    case "skills":
    case "technical skills":
      return "skills";
    case "certifications":
    case "certification":
    case "certificates":
    case "certificate":
    case "licenses & certifications":
    case "licenses and certifications":
    case "certifications & online courses":
    case "certifications and online courses":
      return "certifications";
    case "course":
    case "courses":
    case "coursework":
    case "relevant coursework":
      return "courses";
    case "achievement":
    case "achievements":
    case "honors":
    case "honors & awards":
    case "honors and awards":
    case "award":
    case "awards":
      return "awards";
    case "summary":
      return "summary";
    case "objective":
      return "objective";
    case "extra-curricular":
    case "extracurricular":
    case "extra curricular":
      return "activities";
    case "activities":
      return "activities";
    case "publication":
    case "publications":
      return "publications";
    case "hobby":
    case "hobbies":
      return "hobbies";
    default:
      return null;
  }
}

function detectSections(lines: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const original of lines) {
    const trimmed = original.trim();
    if (!trimmed) continue;

    const isStandaloneHeading =
      !/^\s*([-*•·▪◦]|\d+\.)/.test(trimmed) &&
      trimmed.length <= 80 &&
      trimmed.split(/\s+/).length <= 6;

    if (!isStandaloneHeading) continue;

    const key = sectionKey(trimmed);
    if (!key) continue;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }

  return out;
}

function extractBullets(lines: string[]): string[] {
  const bullets: string[] = [];

  const bulletLine =
    /^\s*(?:[\-*•·▪◦]|\u2022|\u25cf|\u25aa|\u25cb|➤|✓|★|●)\s+.+$/u;

  for (const line of lines) {
    if (bulletLine.test(line)) bullets.push(line.trim());
  }

  return bullets;
}

function buildParsedResume(input: {
  rawText: string;
  fileName: string;
  fileType: "pdf" | "docx";
  fileSizeBytes: number;
}): ParsedResume {
  const rawText = input.rawText.replace(/\u00a0/g, " ");
  const lines = rawText.split(/\r?\n/);
  const wordCount = countWords(rawText);
  const lineCount = lines.length;
  const fileSizeKB = Math.round((input.fileSizeBytes / 1024) * 10) / 10;

  return {
    rawText,
    wordCount,
    lineCount,
    fileType: input.fileType,
    fileName: input.fileName,
    fileSizeKB,
    detectedSections: detectSections(lines),
    bulletPoints: extractBullets(lines),
    hasEmail: /[\w.-]+@[\w.-]+\.\w{2,}/.test(rawText),
    hasPhone: /(\+91|91)?[6-9]\d{9}/.test(rawText.replace(/[\s().-]/g, "")),
    hasLinkedIn: /linkedin/i.test(rawText),
    hasGitHub: /github/i.test(rawText),
    estimatedPageCount: Math.ceil(wordCount / 400),
  };
}

function isProbablyPasswordProtectedPdf(err: unknown): boolean {
  const msg = String(err instanceof Error ? err.message : err).toLowerCase();
  return (
    msg.includes("password") ||
    msg.includes("encrypted") ||
    msg.includes("need a password") ||
    msg.includes("incorrect password") ||
    msg.includes("encryption")
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileField = formData.get("resume");

    if (!(fileField instanceof File)) {
      return NextResponse.json(
        {
          error: "Missing resume file.",
          details: 'Expected multipart field "resume" with a PDF or DOCX.',
        },
        { status: 400 },
      );
    }

    if (fileField.size === 0) {
      return NextResponse.json(
        { error: "Empty file.", details: "Upload a non-empty PDF or DOCX." },
        { status: 400 },
      );
    }

    if (fileField.size > RESUME_MAX_BYTES) {
      return NextResponse.json(
        {
          error: "File too large.",
          details: "Maximum upload size is 5MB.",
        },
        { status: 413 },
      );
    }

    const ext = getExtension(fileField.name);
    const mime = fileField.type;

    if (ext !== ".pdf" && ext !== ".docx") {
      return NextResponse.json(
        { error: "Unsupported file type.", details: "Only PDF and DOCX." },
        { status: 400 },
      );
    }

    if (
      mime &&
      mime !== "application/pdf" &&
      mime !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return NextResponse.json(
        { error: "Unsupported file type.", details: "Only PDF and DOCX." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await fileField.arrayBuffer());
    const fileType: ParsedResume["fileType"] = ext === ".pdf" ? "pdf" : "docx";

    let rawText = "";

    if (fileType === "pdf") {
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const parsedPdf = await pdfParse(buffer);
        rawText = String(parsedPdf.text ?? "");
      } catch (err) {
        if (isProbablyPasswordProtectedPdf(err)) {
          return NextResponse.json(
            {
              error:
                "This PDF is password-protected. Please remove the password and try again.",
              details: "pdf-parse could not decrypt the PDF.",
            },
            { status: 400 },
          );
        }

        return NextResponse.json(
          {
            error: "We couldn't read this PDF.",
            details: String(err instanceof Error ? err.message : err),
          },
          { status: 400 },
        );
      }
    } else {
      const result = await mammoth.extractRawText({ buffer });
      rawText = String(result.value ?? "");
    }

    const trimmedChars = rawText.trim().length;

    if (fileType === "pdf" && trimmedChars < 100) {
      return NextResponse.json(
        {
          error:
            "This looks like a scanned PDF. Please export your resume as a text-based PDF from Word or Google Docs.",
          details: "Insufficient extractable text for a PDF upload.",
        },
        { status: 400 },
      );
    }

    const parsed = buildParsedResume({
      rawText,
      fileName: fileField.name,
      fileType,
      fileSizeBytes: fileField.size,
    });

    if (parsed.wordCount < 50) {
      return NextResponse.json(
        {
          error:
            "We couldn't extract enough text from your resume. Try re-exporting as a fresh PDF.",
          details: `Extracted only ${parsed.wordCount} words.`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Parse failed.",
        details: String(err instanceof Error ? err.message : err),
      },
      { status: 500 },
    );
  }
}
