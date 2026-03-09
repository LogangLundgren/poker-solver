"use client";

import { type HandCell } from "@/lib/range";

interface RangeCellProps {
  cell: HandCell;
  selected: boolean;
  onToggle: (label: string) => void;
}

const typeColors = {
  pair: {
    base: "bg-blue-900/30 border-blue-800/30",
    selected: "bg-blue-600/90 border-blue-400/60 shadow-sm shadow-blue-500/10",
  },
  suited: {
    base: "bg-rose-900/20 border-rose-800/20",
    selected: "bg-rose-600/90 border-rose-400/60 shadow-sm shadow-rose-500/10",
  },
  offsuit: {
    base: "bg-emerald-900/20 border-emerald-800/20",
    selected: "bg-emerald-600/90 border-emerald-400/60 shadow-sm shadow-emerald-500/10",
  },
};

export default function RangeCell({ cell, selected, onToggle }: RangeCellProps) {
  const colors = typeColors[cell.type];
  const style = selected ? colors.selected : colors.base;

  return (
    <button
      onClick={() => onToggle(cell.label)}
      className={`
        aspect-square w-full border text-[10px] sm:text-xs font-medium
        rounded transition-all duration-100 cursor-pointer
        hover:brightness-125 hover:scale-105 flex items-center justify-center
        ${style}
        ${selected ? "text-white font-semibold" : "text-gray-500 hover:text-gray-300"}
      `}
      title={`${cell.label} — ${cell.combos} combos`}
    >
      {cell.label}
    </button>
  );
}
