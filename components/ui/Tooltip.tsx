"use client";

import { useId, useMemo, useState, type ReactNode } from "react";

import { cn } from "@/components/ui/cn";

export function Tooltip({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  const textId = useMemo(() => `tip-${id}`, [id]);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? textId : undefined}>{children}</span>
      {open ? (
        <span
          id={textId}
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-[#faf9f5] p-3 text-xs text-zinc-200 shadow-lg"
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
