"use client";

import { type HandCell } from "@/lib/range";

interface RangeCellProps {
  cell: HandCell;
  selected: boolean;
  onToggle: (label: string) => void;
}

const typeColors = {
  pair: {
    base: "bg-blue-900/40 border-blue-700/50",
    selected: "bg-blue-600 border-blue-400",
  },
  suited: {
    base: "bg-red-900/30 border-red-700/40",
    selected: "bg-red-600 border-red-400",
  },
  offsuit: {
    base: "bg-green-900/30 border-green-700/40",
    selected: "bg-green-600 border-green-400",
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
        rounded-sm transition-colors duration-100 cursor-pointer
        hover:brightness-125 flex items-center justify-center
        ${style}
        ${selected ? "text-white" : "text-gray-400"}
      `}
      title={`${cell.label} — ${cell.combos} combos`}
    >
      {cell.label}
    </button>
  );
}
