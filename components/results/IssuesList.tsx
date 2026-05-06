"use client";

import { LayoutGroup, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { IssueCard } from "@/components/results/IssueCard";
import type { ATSIssue } from "@/lib/types";

type Tab = "all" | ATSIssue["severity"];

function filterIssues(items: ATSIssue[], tab: Tab): ATSIssue[] {
  if (tab === "all") return items;
  return items.filter((i) => i.severity === tab);
}

export function IssuesList({
  issuesCount,
  issues,
}: {
  issuesCount: number;
  issues: ATSIssue[];
}) {
  const tabs: Tab[] = ["all", "critical", "major", "minor"];
  const [tab, setTab] = useState<Tab>("all");

  const filtered = useMemo(() => filterIssues(issues, tab), [issues, tab]);

  return (
    <div className="card-glass space-y-5 p-6 shadow-lg shadow-stone-900/[0.05]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">
            Full checklist
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-white">
            All issues found ({issuesCount})
          </h3>
        </div>
      </div>

      <div className="relative">
        <LayoutGroup id="issue-tabs">
          <div className="flex flex-wrap gap-x-7 gap-y-2 border-b border-white/10">
            {tabs.map((t) => {
              const label =
                t === "all"
                  ? "All"
                  : `${t.slice(0, 1).toUpperCase()}${t.slice(1)}`;

              const active = tab === t;

              return (
                <motion.button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  whileTap={{ scale: 0.96 }}
                  className="relative pb-3 text-sm font-bold text-zinc-400 transition hover:text-white"
                  aria-current={active ? "page" : undefined}
                >
                  <span className={active ? "text-white" : undefined}>{label}</span>
                  {active ? (
                    <motion.span
                      layoutId="issues-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-stone-950 via-emerald-900 to-amber-700"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      <motion.div key={tab} className="space-y-3">
        {filtered.map((issue, idx) => (
          <motion.div
            key={`${tab}-${issue.id}-${issue.title}-${idx}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: Math.min(idx * 0.045, 0.45),
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <IssueCard issue={issue} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
