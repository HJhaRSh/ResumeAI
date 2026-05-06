"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

function colorFor(score: number): string {
  if (score <= 44) return "#E24B4A";
  if (score <= 74) return "#EF9F27";
  return "#639922";
}

export function ScoreGauge({
  score,
  size = 200,
}: {
  score: number;
  size?: number;
}) {
  const clamped = Math.min(100, Math.max(0, score));

  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;

  const stroke = useMemo(() => colorFor(clamped), [clamped]);
  const dashOffset = c - (c * clamped) / 100;

  return (
    <div
      className="relative mx-auto grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#EAE6DC"
          strokeWidth="14"
          fill="transparent"
          strokeLinecap="round"
        />

        <motion.circle
          key={clamped}
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={stroke}
          strokeWidth="14"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c, filter: "drop-shadow(0 0 0px transparent)" }}
          animate={{ 
            strokeDashoffset: dashOffset,
            filter: `drop-shadow(0 0 12px ${stroke}99)`
          }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center text-center px-10">
        <div>
          <p className="text-xs font-semibold text-zinc-300">ATS score</p>
          <p className="text-4xl font-extrabold tracking-tight text-white">{clamped}</p>
          <p className="text-xs text-zinc-400 mt-1">out of 100</p>
        </div>
      </div>
    </div>
  );
}
