"use client";

import { countCombos, combosToPercent } from "@/lib/range";

interface RangeDisplayProps {
  selected: Set<string>;
}

export default function RangeDisplay({ selected }: RangeDisplayProps) {
  const combos = countCombos(selected);
  const percent = combosToPercent(combos);
  const hands = Array.from(selected).slice(0, 30);

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-xl font-bold text-white tabular-nums">{combos}</div>
          <div className="text-[10px] text-gray-500">combos</div>
        </div>
        <div>
          <div className="text-xl font-bold text-white tabular-nums">{percent}%</div>
          <div className="text-[10px] text-gray-500">of hands</div>
        </div>
        <div>
          <div className="text-xl font-bold text-white tabular-nums">{selected.size}</div>
          <div className="text-[10px] text-gray-500">types</div>
        </div>
      </div>

      {/* Percentage bar */}
      <div className="space-y-1">
        <div className="w-full h-2 rounded-full overflow-hidden bg-white/[0.04]">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(Number(percent), 100)}%` }}
          />
        </div>
        <div className="text-[10px] text-gray-600 text-right">{percent}% of 1326</div>
      </div>

      {/* Hand tags */}
      {hands.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {hands.map((h) => (
            <span
              key={h}
              className="px-1.5 py-0.5 text-[10px] font-medium bg-white/[0.04] border border-white/[0.06]
                         rounded text-gray-400"
            >
              {h}
            </span>
          ))}
          {selected.size > 30 && (
            <span className="px-1.5 py-0.5 text-[10px] text-gray-600">
              +{selected.size - 30} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
