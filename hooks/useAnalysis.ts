"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { hasLowDocxExtractionWarning, hasNonEnglishWarning } from "@/lib/fileHelpers";
import type { AnalysisResult, ParsedResume } from "@/lib/types";

export const RESUMECHECK_STORAGE_KEY = "resumecheck_result";

export type StoredAnalysisPayload = {
  result: AnalysisResult;
  notice?: string;
  warnings: string[];
  parsedMeta: Pick<ParsedResume, "fileName" | "fileType" | "wordCount">;
};

function readErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "Something went wrong.";
  const o = payload as Record<string, unknown>;
  if (typeof o.error === "string" && o.error.trim()) return o.error;
  if (typeof o.details === "string" && o.details.trim()) return o.details;
  return "Something went wrong.";
}

export function useAnalysis() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const persistAndGoToResults = useCallback(
    (payload: StoredAnalysisPayload) => {
      localStorage.setItem(RESUMECHECK_STORAGE_KEY, JSON.stringify(payload));
      router.push("/results");
    },
    [router],
  );

  const runPipeline = useCallback(
    async (file: File, jobDescription?: string) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const form = new FormData();
        form.set("resume", file);

        const parseRes = await fetch("/api/parse", {
          method: "POST",
          body: form,
        });

        const parsePayload: unknown = await parseRes.json();
        if (!parseRes.ok) {
          throw new Error(readErrorMessage(parsePayload));
        }

        const parsed = parsePayload as ParsedResume;

        const warnings: string[] = [];
        if (hasNonEnglishWarning(parsed.rawText)) {
          warnings.push(
            "This resume appears to be in a non-English language. Results may be less accurate.",
          );
        }

        if (hasLowDocxExtractionWarning({ fileType: parsed.fileType, wordCount: parsed.wordCount })) {
          warnings.push(
            "Some content may not have been extracted. For best results, use the PDF version.",
          );
        }

        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ parsed, jobDescription }),
        });

        const analyzePayload: unknown = await analyzeRes.json();
        if (!analyzeRes.ok) {
          throw new Error(readErrorMessage(analyzePayload));
        }

        const full = analyzePayload as AnalysisResult & { notice?: string };
        const { notice: maybeNotice, ...result } = full;

        persistAndGoToResults({
          result,
          notice: maybeNotice,
          warnings,
          parsedMeta: {
            fileName: parsed.fileName,
            fileType: parsed.fileType,
            wordCount: parsed.wordCount,
          },
        });
      } catch (e) {
        setError(String(e instanceof Error ? e.message : e));
      } finally {
        setIsAnalyzing(false);
      }
    },
    [persistAndGoToResults],
  );

  return useMemo(
    () => ({
      isAnalyzing,
      error,
      clearError,
      runPipeline,
    }),
    [isAnalyzing, error, clearError, runPipeline],
  );
}
