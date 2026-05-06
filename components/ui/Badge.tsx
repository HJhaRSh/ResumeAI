import type { ReactNode } from "react";

import { cn } from "@/components/ui/cn";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const hasBg = className?.includes("bg-") || className?.includes("from-");
  const hasText = className?.includes("text-");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold",
        !hasBg && "bg-zinc-900/70",
        !hasText && "text-zinc-200",
        className,
      )}
    >
      {children}
    </span>
  );
}
