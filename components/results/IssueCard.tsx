"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import type { ATSIssue, Category } from "@/lib/types";

function severityStyles(sev: ATSIssue["severity"]) {
  if (sev === "critical")
    return { dot: "bg-rose-500", badge: "bg-rose-500/10 text-rose-400" };
  if (sev === "major")
    return { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-400" };
  return { dot: "bg-zinc-500", badge: "bg-zinc-500/10 text-zinc-400" };
}

function categoryStyles(cat: Category): string {
  const map: Record<Category, string> = {
    format: "bg-sky-500/10 text-sky-400 ring-sky-500/20",
    structure: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
    content: "bg-teal-500/10 text-teal-400 ring-teal-500/20",
    keywords: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
    impact: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    length: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
  };
  return map[cat];
}

export function IssueCard({
  issue,
  defaultExpanded = false,
}: {
  issue: ATSIssue;
  defaultExpanded?: boolean;
}) {
  const [open, setOpen] = useState(defaultExpanded);
  useEffect(() => setOpen(defaultExpanded), [defaultExpanded]);

  const sev = useMemo(() => severityStyles(issue.severity), [issue.severity]);

  return (
    <motion.div
      layout
      className={cn(
        "overflow-hidden rounded-2xl border border-white/5 bg-white/5 ring-1 ring-white/10 backdrop-blur-md",
        "shadow-md shadow-black/20",
        open && "shadow-[0_14px_40px_-22px_rgba(0,0,0,0.5)]",
      )}
      whileHover={{
        scale: 1.02,
        y: -2,
        boxShadow: "0 20px 40px -10px rgb(0 0 0 / 0.12)",
        transition: { type: "spring", stiffness: 400, damping: 20 },
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex min-w-0 gap-3">
          <span
            className={cn(
              "mt-2 h-2 w-2 shrink-0 rounded-full shadow-sm ring-1 ring-black/10",
              sev.dot,
            )}
            aria-hidden
          />

          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge className={cn("border-transparent ring-1", sev.badge)}>
                {issue.severity}
              </Badge>
              <Badge className={cn("border-transparent ring-1", categoryStyles(issue.category))}>
                {issue.category}
              </Badge>
            </div>

            <p className="mt-2 text-sm font-extrabold text-white">{issue.title}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge className="border-transparent bg-gradient-to-br from-stone-900 to-stone-800 text-white ring-1 ring-white/10">
            ↑ +{issue.points}pts
          </Badge>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 440, damping: 28 }}
            className="inline-flex"
          >
            <ChevronDown className="h-5 w-5 text-zinc-300" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4 pt-1">
              <p className="text-sm leading-relaxed text-zinc-200">{issue.description}</p>

              <div className="rounded-2xl bg-black/40 p-4 ring-1 ring-white/10">
                <p className="text-xs font-extrabold uppercase tracking-wide text-zinc-500">
                  How to fix
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{issue.howToFix}</p>
              </div>

              {issue.affectedText ? (
                <div>
                  <p className="text-xs font-extrabold text-zinc-100">Affected text</p>
                  <pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-black/40 p-3 font-mono text-xs leading-relaxed text-zinc-300 ring-1 ring-white/10">
                    {issue.affectedText}
                  </pre>
                </div>
              ) : null}

              {issue.improvedVersion ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs font-extrabold text-zinc-100">Suggested rewrite</p>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-400">
                    {issue.improvedVersion}
                  </p>
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
