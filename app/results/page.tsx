"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ImprovedBulletCard } from "@/components/results/ImprovedBullet";
import { IssuesList } from "@/components/results/IssuesList";
import { IssueCard } from "@/components/results/IssueCard";
import { ScoreBreakdown } from "@/components/results/ScoreBreakdown";
import { ScoreGauge } from "@/components/results/ScoreGauge";
import { ShareCard } from "@/components/results/ShareCard";
import { Button } from "@/components/ui/Button";
import { RESUMECHECK_STORAGE_KEY, type StoredAnalysisPayload } from "@/hooks/useAnalysis";
import { GRADE_DESCRIPTOR } from "@/lib/scoreCalculator";
import type { AnalysisResult } from "@/lib/types";

function tintForScore(score: number): string {
  if (score <= 44) return "#E24B4A";
  if (score <= 74) return "#EF9F27";
  return "#639922";
}

function gradeBadgeClass(score: number): string {
  if (score <= 44) return "bg-rose-500/10 text-rose-400 ring-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]";
  if (score <= 74)
    return "bg-amber-500/10 text-amber-400 ring-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]";
  return "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]";
}

const sectionMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
};

export default function ResultsPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<StoredAnalysisPayload | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESUMECHECK_STORAGE_KEY);
      if (!raw) {
        router.replace("/?notice=please-upload");
        return;
      }
      const parsed = JSON.parse(raw) as StoredAnalysisPayload;
      if (!parsed?.result) {
        router.replace("/?notice=please-upload");
        return;
      }
      setPayload(parsed);
    } catch {
      router.replace("/?notice=please-upload");
    }
  }, [router]);

  const result: AnalysisResult | null = payload?.result ?? null;

  const tint = useMemo(() => (result ? tintForScore(result.overallScore) : "#639922"), [result]);

  if (!result || !payload) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-app-gradient">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-[0.75]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5">
          <motion.div
            className="h-52 w-[min(480px,100%)] rounded-[2rem] bg-zinc-900/50 ring-1 ring-stone-900/10 backdrop-blur-md"
            animate={{ opacity: [0.45, 0.95, 0.45], scale: [0.98, 1, 0.98] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0 bg-app-gradient opacity-[0.4]" />
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-[0.85]" />
      <div className="pointer-events-none absolute top-[-20%] right-[-14%] h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px] mix-blend-screen" />
      <div className="pointer-events-none absolute bottom-[-12%] left-[-14%] h-[450px] w-[450px] rounded-full bg-violet-500/20 blur-[120px] mix-blend-screen" />
      <div className="pointer-events-none absolute top-[30%] left-[20%] h-[300px] w-[300px] rounded-full bg-amber-500/10 blur-[100px] mix-blend-screen" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-28 pb-6 sm:pt-32 sm:pb-10">
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full border border-white/65 bg-zinc-900/75 px-3 py-2 text-sm font-bold text-zinc-100 shadow-md shadow-stone-900/[0.06] backdrop-blur-md ring-1 ring-stone-900/10 transition hover:bg-zinc-900 hover:shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" aria-hidden />
              Upload another file
            </Link>
          </motion.div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-950/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.26em] text-[#dbf6c8] ring-1 ring-white/25">
              Results
            </span>
            {result.jdMatch && (
              <div className="relative group">
                <motion.span 
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center rounded-full bg-violet-950/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-violet-300 ring-1 ring-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)] cursor-help"
                >
                  JD Fit Active
                </motion.span>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-64 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-[-8px] group-hover:translate-y-0 z-50">
                   <div className="bg-zinc-800 border-2 border-violet-500 p-3.5 rounded-[1.25rem] shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(139,92,246,0.3)] text-[11px] text-white normal-case leading-relaxed">
                     <p className="font-black text-violet-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                       <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                       Targeted Fit Analysis
                     </p>
                     This score is a <span className="text-violet-200 font-bold">50/50 blend</span> of your resume's general ATS quality and its specific semantic match against the Job Description you provided.
                   </div>
                   {/* Tooltip arrow */}
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[8px] w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-violet-500" />
                </div>
              </div>
            )}
            <span className="hidden max-w-[200px] truncate text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:inline">
              {payload.parsedMeta?.fileName ?? "Resume"}
            </span>
          </div>
        </motion.nav>

        <div className="space-y-7">
          <AnimatePresence>
            {payload.notice ? (
              <motion.div
                key="notice"
                {...sectionMotion}
                className="rounded-3xl border border-amber-200/70 bg-gradient-to-r from-white via-amber-50 to-white px-5 py-4 text-sm font-semibold text-amber-950 shadow-lg shadow-amber-900/[0.08] backdrop-blur-md ring-1 ring-white/65"
              >
                {payload.notice}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {payload.warnings?.length ? (
              <div key="warnings" className="space-y-2">
                {payload.warnings.map((w, i) => (
                  <motion.div
                    key={`${w}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.42 }}
                    className="rounded-3xl border border-amber-200/70 bg-[#faf4e9] px-4 py-4 text-sm font-medium text-[#593104] shadow-md shadow-amber-900/[0.06] backdrop-blur-sm"
                  >
                    {w}
                  </motion.div>
                ))}
              </div>
            ) : null}
          </AnimatePresence>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-start">
            <div className="space-y-6">
              <motion.section
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="card-glass px-6 py-7 ring-2 ring-emerald-900/[0.04]"
              >
                <div className="flex flex-col items-center gap-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" />
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 rounded-full blur-2xl"
                      aria-hidden
                      style={{ background: `radial-gradient(circle at 50% 50%, ${tint}40, transparent 70%)` }}
                      animate={{ opacity: [0.6, 1, 0.6], scale: [0.94, 1.05, 0.94] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="relative z-10 drop-shadow-2xl bg-black/20 rounded-full p-2 ring-1 ring-white/5">
                      <ScoreGauge score={result.overallScore} />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3 text-center">
                    <motion.div
                      layout
                      className={`inline-flex items-center justify-center rounded-[1.125rem] px-7 py-2.5 text-3xl font-black ring-2 shadow-lg backdrop-blur-sm ${gradeBadgeClass(
                        result.overallScore,
                      )}`}
                      whileHover={{ scale: 1.04 }}
                      transition={{ type: "spring", stiffness: 420, damping: 22 }}
                    >
                      {result.grade}
                    </motion.div>
                    <div>
                      <p className="text-base font-extrabold text-white">
                        {GRADE_DESCRIPTOR[result.grade]}
                      </p>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-300">
                        {result.estimatedPassRate}
                      </p>
                      {result.jdMatch && (
                        <p className="mt-1 text-[10px] font-bold text-violet-400/80 uppercase tracking-tight">
                          * Tailored to your provided Job Description
                        </p>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed text-zinc-200">{result.summary}</p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.52, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="card-glass px-5 py-4"
              >
                <div className="flex items-center justify-between gap-2 px-2 pb-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">
                    Radar
                  </p>
                  <motion.span
                    className="h-2 w-14 rounded-full"
                    style={{ background: tint }}
                    layoutId="accent-bar"
                  />
                </div>
                <ScoreBreakdown breakdown={result.breakdown} tint={tint} />
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.52, delay: 0.11, ease: [0.22, 1, 0.36, 1] }}
                className="card-glass px-6 py-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-extrabold text-white">What you did well</h3>
                  <span className="rounded-full bg-emerald-950/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#dbf6c8]">
                    Shine
                  </span>
                </div>
                <ul className="mt-5 space-y-3">
                  {result.positives.length ? (
                    result.positives.map((p, idx) => (
                      <motion.li
                        key={p}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        className="flex gap-3 text-sm text-zinc-100"
                      >
                        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#639922]/40 to-transparent ring-1 ring-[#639922]/50 shadow-[0_0_15px_rgba(99,153,34,0.3)]">
                          <Check className="h-4 w-4 text-[#dbf6c8]" />
                        </span>
                        <span className="flex-1 leading-relaxed">{p}</span>
                      </motion.li>
                    ))
                  ) : (
                    <li className="text-sm leading-relaxed text-zinc-400">
                      No AI-written positives are available for this run — focus on the prioritised fixes
                      on the right.
                    </li>
                  )}
                </ul>
              </motion.section>

              {result.jdMatch ? (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.52, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="card-glass px-6 py-6 ring-1 ring-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.1)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex items-center justify-between gap-3 relative z-10 mb-2">
                    <h3 className="text-lg font-extrabold text-white">Job Match Analysis</h3>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-3 py-1 text-[13px] font-black text-violet-300 shadow-inner">
                        {result.jdMatch.score}% Fit
                      </span>
                      {result.jdMatch.verdict && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          result.jdMatch.score < 50 ? "text-rose-400 font-black" : "text-emerald-400"
                        }`}>
                          {result.jdMatch.verdict}
                        </span>
                      )}
                    </div>
                  </div>

                  {result.jdMatch.advice ? (
                    <div className="relative z-10 mb-5 p-3 rounded-xl bg-violet-950/30 border border-violet-500/20 shadow-inner">
                      <p className="text-sm leading-relaxed text-zinc-300">
                        <span className="font-semibold text-violet-300">AI Strategy: </span>
                        {result.jdMatch.advice}
                      </p>
                    </div>
                  ) : null}
                  
                  {result.jdMatch.missingKeywords.length > 0 ? (
                    <div className="mt-2 relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 mb-2 ml-1">Missing Hard Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {result.jdMatch.missingKeywords.map(k => (
                          <span key={k} className="px-2.5 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-lg text-xs font-bold shadow-sm">{k}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {result.jdMatch.matchingKeywords.length > 0 ? (
                    <div className="mt-5 relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2 ml-1">Matching Hard Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {result.jdMatch.matchingKeywords.map(k => (
                          <span key={k} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg text-xs font-bold shadow-sm">{k}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </motion.section>
              ) : null}
            </div>

            <div className="space-y-10">
              <motion.section
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.52, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="card-glass px-6 py-7"
              >
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.34em] text-rose-500">
                      Highest leverage
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold text-white">
                      Fix these first
                    </h3>
                  </div>
                  <motion.div
                    className="rounded-2xl bg-gradient-to-br from-rose-700 to-orange-700 px-3 py-1.5 text-xs font-bold text-[#fff4f4] shadow-md shadow-orange-900/25"
                    whileHover={{ rotate: [-1.5, 1.5, 0], scale: 1.03 }}
                  >
                    +
                    {(result.topThreeFixes.length
                      ? Math.max(...result.topThreeFixes.map((i) => i.points))
                      : 0
                    ).toLocaleString()}
                    pts max impact
                  </motion.div>
                </div>

                <div className="mt-5 space-y-3">
                  {result.topThreeFixes.map((issue) => (
                    <IssueCard key={`top-${issue.id}-${issue.title}`} issue={issue} />
                  ))}
                </div>
              </motion.section>

              <IssuesList issues={result.issues} issuesCount={result.issues.length} />

              {result.improvedBullets.length ? (
                <motion.section
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5 }}
                  className="card-glass px-6 py-7"
                >
                  <motion.h3
                    className="text-xl font-extrabold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span aria-hidden className="mr-1.5 align-middle">
                      ✨
                    </span>
                    Here&apos;s how your bullets could look
                  </motion.h3>

                  <div className="mt-6 space-y-8">
                    {result.improvedBullets.map((b, idx) => (
                      <motion.div
                        key={`${b.original}-${b.improved}`}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: idx * 0.06 }}
                      >
                        <ImprovedBulletCard item={b} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ) : null}

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <ShareCard result={result} topIssueCount={result.topThreeFixes.length} />
              </motion.div>

              <motion.div
                className="pb-14"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  className="relative h-14 w-full overflow-hidden rounded-2xl bg-zinc-950 hover:bg-zinc-900 px-6 text-[16px] font-extrabold text-white ring-1 ring-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all"
                  onClick={() => {
                    localStorage.removeItem(RESUMECHECK_STORAGE_KEY);
                    router.push("/");
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowLeft className="w-5 h-5 text-emerald-400" />
                    Analyse another resume
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
