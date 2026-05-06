export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx"]);
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx === -1) return "";
  return filename.slice(idx).toLowerCase();
}

export function validateResumeFile(file: File): string | null {
  if (file.size > RESUME_MAX_BYTES) {
    return "File too large. Please compress your PDF or re-export at lower quality.";
  }

  const ext = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return "Only PDF and DOCX files are supported.";
  }

  if (file.type && !ALLOWED_MIME.has(file.type)) {
    return "Only PDF and DOCX files are supported.";
  }

  return null;
}

export function asciiRatio(text: string): number {
  if (!text) return 1;
  let ascii = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code <= 127) ascii += 1;
  }
  return ascii / text.length;
}

export function hasNonEnglishWarning(text: string): boolean {
  return asciiRatio(text) < 0.2;
}

export function hasLowDocxExtractionWarning(params: {
  fileType: "pdf" | "docx";
  wordCount: number;
}): boolean {
  return params.fileType === "docx" && params.wordCount < 150;
}
