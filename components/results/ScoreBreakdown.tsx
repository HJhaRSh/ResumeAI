"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

import type { ScoreBreakdown as Breakdown } from "@/lib/types";

export function ScoreBreakdown({
  breakdown,
  tint,
}: {
  breakdown: Breakdown;
  tint: string;
}) {
  const data = [
    { axis: "Format", value: breakdown.format },
    { axis: "Structure", value: breakdown.structure },
    { axis: "Content", value: breakdown.content },
    { axis: "Keywords", value: breakdown.keywords },
    { axis: "Impact", value: breakdown.impact },
    { axis: "Length", value: breakdown.length },
  ];

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
          <PolarGrid stroke="rgba(23,23,23,0.08)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: "#5f5e5a", fontSize: 11 }} />
          <RechartsTooltip
            formatter={(value) => [`${value}`, "Score"]}
            contentStyle={{
              borderRadius: 12,
              borderColor: "rgba(23,23,23,0.12)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          />
          <Radar
            name="Sub-score"
            dataKey="value"
            stroke={tint}
            fill={tint}
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
