"use client";

import html2canvas from "html2canvas";
import { Copy, Image as ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/Button";
import type { AnalysisResult } from "@/lib/types";

function buildShareText(result: AnalysisResult, topIssueCount: number): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return [
    `ResumeCheck — ATS score: ${result.overallScore}/100 (Grade ${result.grade})`,
    `Top issues to fix first: ${topIssueCount}`,
    result.estimatedPassRate,
    ...(origin ? ["", origin] : []),
  ].join("\n");
}

export function ShareCard({
  result,
  topIssueCount,
}: {
  result: AnalysisResult;
  topIssueCount: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-violet-400" /> Share your score
      </h3>

      <div
        ref={ref}
        className="rounded-3xl border border-white/10 bg-[#0f0f13] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-400">ResumeCheck AI</p>
            <p className="mt-3 text-5xl font-black tracking-tight text-white">
              {result.overallScore}
              <span className="text-xl font-bold text-zinc-400 ml-1">/100</span>
            </p>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-300 ring-1 ring-violet-500/30">
                Grade {result.grade}
              </span>
              <p className="text-sm font-bold text-zinc-300">
                {result.estimatedPassRate}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-900 px-5 py-4 text-white border border-white/10 flex flex-col items-center shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Top Fixes</span>
            <span className="text-3xl font-black text-rose-400 mt-1">{topIssueCount}</span>
          </div>
        </div>
      </div>

      {status ? (
        <motion.p 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-sm font-bold text-emerald-400 bg-emerald-950/50 px-4 py-2.5 rounded-xl border border-emerald-500/20 text-center shadow-md"
        >
          {status}
        </motion.p>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1 bg-white hover:bg-zinc-200 text-black font-extrabold h-12 rounded-xl transition-transform hover:scale-[1.02] active:scale-95 shadow-lg"
          onClick={async () => {
            setStatus(null);
            const el = ref.current;
            if (!el) return;
            try {
              const canvas = await html2canvas(el, {
                backgroundColor: "#0f0f13",
                scale: 2,
                useCORS: true,
                logging: false,
              });
              const blob: Blob | null = await new Promise((resolve) =>
                canvas.toBlob((b) => resolve(b), "image/png"),
              );
              if (!blob) throw new Error("Could not create image.");
              await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
              ]);
              setStatus("Copied image to clipboard!");
            } catch {
              const ok = await (async () => {
                try {
                  await navigator.clipboard.writeText(buildShareText(result, topIssueCount));
                  return true;
                } catch {
                  return false;
                }
              })();
              setStatus(
                ok
                  ? "Image copy blocked by browser. Copied text version instead."
                  : "Couldn’t copy. Please try again.",
              );
            }
          }}
        >
          <ImageIcon className="h-4 w-4 mr-2 text-violet-600" />
          Copy as Image
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="flex-1 bg-zinc-900 hover:bg-zinc-800 !text-white font-extrabold h-12 rounded-xl border border-white/10 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg"
          onClick={async () => {
            setStatus(null);
            const ok = await (async () => {
              try {
                await navigator.clipboard.writeText(buildShareText(result, topIssueCount));
                return true;
              } catch {
                return false;
              }
            })();
            setStatus(ok ? "Copied score text!" : "Couldn’t copy text.");
          }}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Text
        </Button>
      </div>
    </div>
  );
}
