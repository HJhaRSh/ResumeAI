"use client";

import { motion } from "framer-motion";
import { FileText, X } from "lucide-react";

export function FilePreview({
  file,
  onRemove,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const kb = Math.round(file.size / 102.4) / 10;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="flex w-full max-w-xl items-start justify-between gap-3 rounded-3xl border border-white/10 bg-zinc-900/85 p-5 shadow-lg shadow-stone-900/[0.06] ring-1 ring-white/60 backdrop-blur-md"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <motion.span
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#639922]/20 to-[#639922]/5 ring-1 ring-[#639922]/30"
            whileHover={{ rotate: [-2, 2, -2], transition: { duration: 0.5 } }}
          >
            <FileText className="h-5 w-5 text-[#3d5f14]" aria-hidden />
          </motion.span>
          <div className="min-w-0 pt-0.5">
            <p className="truncate font-bold text-white">{file.name}</p>
            <p className="mt-1 text-xs font-medium text-zinc-400">{kb} KB · ready</p>
          </div>
        </div>
      </div>
      <motion.button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        aria-label="Remove file"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-900/[0.04] text-zinc-300 ring-1 ring-stone-900/10 transition-colors hover:bg-rose-50 hover:text-rose-800 hover:ring-rose-200 disabled:pointer-events-none disabled:opacity-50"
      >
        <X className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
