"use client";

import { countCombos, combosToPercent } from "@/lib/range";

interface RangeDisplayProps {
  selected: Set<string>;
}

export default function RangeDisplay({ selected }: RangeDisplayProps) {
  const combos = countCombos(selected);
  const percent = combosToPercent(combos);
  const hands = Array.from(selected).slice(0, 40);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-400">
          <span className="text-white font-semibold text-lg">{combos}</span> combos
        </div>
        <div className="text-sm text-gray-400">
          <span className="text-white font-semibold text-lg">{percent}%</span> of hands
        </div>
        <div className="text-sm text-gray-400">
          <span className="text-white font-semibold text-lg">{selected.size}</span> hand types
        </div>
      </div>
      {hands.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hands.map((h) => (
            <span
              key={h}
              className="px-2 py-0.5 text-xs font-medium bg-gray-800 border border-gray-700
                         rounded text-gray-300"
            >
              {h}
            </span>
          ))}
          {selected.size > 40 && (
            <span className="px-2 py-0.5 text-xs text-gray-500">
              +{selected.size - 40} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
