import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/components/ui/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  isLoading,
  disabled,
  children,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-[transform,box-shadow,background-color] duration-200 ease-out active:translate-y-[0.5px] active:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-px hover:shadow-md";

  const styles =
    variant === "primary"
      ? "bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 text-white shadow-lg shadow-stone-900/25 ring-1 ring-white/10 hover:shadow-xl hover:shadow-stone-900/30 hover:brightness-105 active:scale-[0.99]"
      : variant === "secondary"
        ? "bg-zinc-900/90 text-zinc-100 shadow-md shadow-stone-900/8 ring-1 ring-stone-900/12 hover:bg-zinc-900 hover:shadow-lg active:scale-[0.99]"
        : "bg-transparent text-zinc-100 ring-1 ring-transparent hover:bg-zinc-900/5 hover:ring-stone-900/10 active:scale-[0.99]";

  return (
    <button
      className={cn(base, styles, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
}
