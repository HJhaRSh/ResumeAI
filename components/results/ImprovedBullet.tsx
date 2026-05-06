"use client";

import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import type { ImprovedBullet as ImprovedBulletType } from "@/lib/types";

const WEAK = [
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

function highlightWeakParts(text: string): ReactNode {
  const lower = text.toLowerCase();
  for (const w of WEAK) {
    const idx = lower.indexOf(w.toLowerCase());
    if (idx === 0) {
      return (
        <span className="relative">
          <span className="border-b-2 border-[#E24B4A] pb-px">{text.slice(0, w.length)}</span>
          <span>{text.slice(w.length)}</span>
        </span>
      );
    }
  }

  const hasDigits = /\d/.test(text);
  if (!hasDigits) {
    const words = text.split(" ");
    const head = Math.min(words.length, 14);
    return (
      <span className="relative">
        {words.slice(0, Math.max(head - 3, 0)).join(" ")}{" "}
        <span className="border-b-2 border-[#E24B4A] pb-px">
          {words.slice(Math.max(head - 3, 0), head).join(" ")}
        </span>
        {words.length > head ? <span>{` ${words.slice(head).join(" ")}`}</span> : null}
      </span>
    );
  }

  return text;
}

async function writeClipboardSafe(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function ImprovedBulletCard({ item }: { item: ImprovedBulletType }) {
  const [copied, setCopied] = useState(false);

  const before = useMemo(() => highlightWeakParts(item.original), [item.original]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl bg-zinc-900/[0.04] p-4 ring-1 ring-stone-900/10"
      >
        <p className="text-xs font-extrabold text-zinc-100">Before</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-100">{before}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl bg-[#e9f3dd] p-4 ring-1 ring-[#639922]/25"
      >
        <p className="text-xs font-extrabold text-emerald-950">After</p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-950">{item.improved}</p>

        <p className="mt-3 text-xs text-emerald-950/80">
          <span className="font-semibold">What changed:</span> {item.whatChanged}
        </p>

        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              const ok = await writeClipboardSafe(item.improved);
              if (!ok) return;
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            }}
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy improved version
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
