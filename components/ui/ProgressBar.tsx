import { cn } from "@/components/ui/cn";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const v = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn("h-2 w-full rounded-full bg-zinc-900/10", className)}
      aria-label="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
    >
      <div
        className="h-2 rounded-full bg-zinc-900 transition-[width] duration-700 ease-out"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
