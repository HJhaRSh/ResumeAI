"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/components/ui/cn";

type StepDef = {
  title: string;
};

const STEPS = [
  { title: "Reading your resume..." },
  { title: "Running 18 ATS checks..." },
  { title: "Generating improvements..." },
] satisfies StepDef[];

export function ParseProgress({
  active,
}: {
  active: boolean;
}) {
  const [completed, setCompleted] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ]);

  useEffect(() => {
    if (!active) {
      setCompleted([true, true, true]);
      return;
    }

    setCompleted([false, false, false]);
    const t1 = window.setTimeout(() => setCompleted([true, false, false]), 1200);
    const t2 = window.setTimeout(() => setCompleted([true, true, false]), 2400);
    const t3 = window.setTimeout(() => setCompleted([true, true, true]), 4800);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [active]);

  const dots = useMemo(() => STEPS.map((_, i) => completed[i]), [completed]);
  const firstIncomplete = dots.findIndex((d) => !d);
  const completedCount = dots.filter(Boolean).length;
  const progressPct = completedCount / STEPS.length;

  if (!active) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-[0_0_40px_rgba(139,92,246,0.15)] backdrop-blur-xl ring-1 ring-white/5"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3 pb-4">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
          Analysis Pipeline
        </p>
        <motion.p
          className="text-xs font-black tabular-nums text-white bg-zinc-900 px-3 py-1 rounded-full border border-white/10 shadow-inner"
          key={completedCount}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {Math.round(progressPct * 100)}%
        </motion.p>
      </div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-zinc-900 shadow-inner ring-1 ring-white/5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]"
          initial={{ width: "0%" }}
          animate={{
            width: `${progressPct <= 0 ? 8 : Math.round(progressPct * 100)}%`,
          }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="space-y-3">
        {STEPS.map((s, idx) => {
          const done = dots[idx];
          const running = firstIncomplete === idx && !done;

          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className={cn(
                "relative flex items-center gap-4 rounded-2xl px-4 py-3 overflow-hidden border transition-all duration-500",
                done && "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
                running && "bg-white/5 border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.15)]",
                !done && !running && "bg-transparent border-white/5"
              )}
            >
              {running && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent -translate-x-full animate-shimmer" />
              )}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 shadow-inner ring-1 ring-white/10 z-10">
                {done ? (
                  <motion.span
                    initial={{ scale: 0.72, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 520, damping: 26 }}
                    className="inline-flex rounded-full bg-emerald-500/20 p-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  >
                    <Check className="h-4 w-4 text-emerald-400" />
                  </motion.span>
                ) : (
                  <Loader2
                    className={cn(
                      "h-5 w-5",
                      running ? "animate-spin text-violet-400" : "text-zinc-700",
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  "min-w-0 flex-1 text-sm font-bold z-10",
                  done && "text-emerald-300",
                  !done && running && "text-white drop-shadow-md",
                  !done && !running && "text-zinc-600",
                )}
              >
                {s.title}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
