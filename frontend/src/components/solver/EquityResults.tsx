"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { EquityResponse } from "@/lib/api";

const PLAYER_COLORS = [
  { bar: "bg-blue-500", text: "text-blue-400", ring: "stroke-blue-500", dot: "bg-blue-400" },
  { bar: "bg-red-500", text: "text-red-400", ring: "stroke-red-500", dot: "bg-red-400" },
  { bar: "bg-amber-500", text: "text-amber-400", ring: "stroke-amber-500", dot: "bg-amber-400" },
  { bar: "bg-purple-500", text: "text-purple-400", ring: "stroke-purple-500", dot: "bg-purple-400" },
  { bar: "bg-pink-500", text: "text-pink-400", ring: "stroke-pink-500", dot: "bg-pink-400" },
  { bar: "bg-cyan-500", text: "text-cyan-400", ring: "stroke-cyan-500", dot: "bg-cyan-400" },
];

function DonutChart({ players }: { players: { equity: number }[] }) {
  const size = 130;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;
  const segments = players.map((p, idx) => {
    const offset = accumulated;
    accumulated += p.equity;
    return {
      offset: (offset / 100) * circumference,
      length: (p.equity / 100) * circumference,
      color: PLAYER_COLORS[idx % 6].ring,
    };
  });

  const leader = players.reduce((max, p, i) =>
    p.equity > (players[max]?.equity ?? 0) ? i : max, 0);
  const leaderColor = PLAYER_COLORS[leader % 6];

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="hsl(240 6% 12%)" strokeWidth={strokeWidth}
        />
        {segments.map((seg, idx) => (
          <circle
            key={idx}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            className={cn(seg.color, "transition-all duration-700")}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.length} ${circumference - seg.length}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold tabular-nums", leaderColor.text)}>
          {players[leader].equity.toFixed(1)}%
        </span>
        <span className="text-[10px] text-gray-500">P{leader + 1}</span>
      </div>
    </div>
  );
}

interface EquityResultsProps {
  result: EquityResponse;
}

export default function EquityResults({ result }: EquityResultsProps) {
  return (
    <div className="glass-panel p-5 space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="section-label">Results</span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
            {result.method === "exact" ? "Exact" : "Monte Carlo"}
          </Badge>
          <span className="text-[10px] text-gray-600 tabular-nums">
            {result.iterations.toLocaleString()} boards &middot; {result.elapsed_ms.toFixed(0)}ms
          </span>
        </div>
      </div>

      {/* Donut + Player List */}
      <div className="flex items-start gap-6">
        <DonutChart players={result.players} />

        <div className="flex-1 space-y-3 min-w-0">
          {result.players.map((player, idx) => {
            const colors = PLAYER_COLORS[idx % 6];
            const total = player.wins + player.ties + player.losses;
            const winPct = total > 0 ? (player.wins / total) * 100 : 0;
            const tiePct = total > 0 ? (player.ties / total) * 100 : 0;

            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2.5 h-2.5 rounded-full", colors.dot)} />
                    <span className="text-xs text-gray-400">Player {idx + 1}</span>
                  </div>
                  <span className={cn("text-xl font-bold tabular-nums animate-count-up", colors.text)}>
                    {player.equity.toFixed(1)}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/[0.04]">
                  <div
                    className={cn("h-full rounded-l-full", colors.bar, "animate-bar-grow")}
                    style={{ width: `${winPct}%` }}
                  />
                  <div
                    className="h-full bg-gray-500/60 animate-bar-grow"
                    style={{ width: `${tiePct}%` }}
                  />
                </div>

                <div className="flex gap-4 text-[10px] text-gray-600 tabular-nums">
                  <span>W {player.wins.toLocaleString()}</span>
                  <span>T {player.ties.toLocaleString()}</span>
                  <span>L {player.losses.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
