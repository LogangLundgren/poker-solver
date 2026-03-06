"use client";

import type { EquityResponse } from "@/lib/api";

const PLAYER_COLORS = [
  "bg-blue-500", "bg-red-500", "bg-yellow-500",
  "bg-purple-500", "bg-pink-500", "bg-cyan-500",
];

interface EquityResultsProps {
  result: EquityResponse;
}

export default function EquityResults({ result }: EquityResultsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Results</h3>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span>Method: {result.method}</span>
          <span>{result.iterations.toLocaleString()} iterations</span>
          <span>{result.elapsed_ms.toFixed(0)}ms</span>
        </div>
      </div>

      {/* Equity bars */}
      <div className="space-y-2">
        {result.players.map((player, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Player {idx + 1}</span>
              <span className="font-bold text-white">{player.equity.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full ${PLAYER_COLORS[idx % 6]} rounded-full transition-all duration-500`}
                style={{ width: `${player.equity}%` }}
              />
            </div>
            <div className="flex gap-4 text-[10px] text-gray-500">
              <span>Win: {player.wins.toLocaleString()}</span>
              <span>Tie: {player.ties.toLocaleString()}</span>
              <span>Lose: {player.losses.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
