"use client";

import { useMemo } from "react";
import { buildGrid } from "@/lib/range";
import RangeCell from "./RangeCell";

interface RangeMatrixProps {
  selected: Set<string>;
  onToggle: (label: string) => void;
}

export default function RangeMatrix({ selected, onToggle }: RangeMatrixProps) {
  const grid = useMemo(() => buildGrid(), []);

  return (
    <div className="grid grid-cols-13 gap-[2px] sm:gap-1 w-full max-w-[520px]">
      {grid.flatMap((row) =>
        row.map((cell) => (
          <RangeCell
            key={cell.label}
            cell={cell}
            selected={selected.has(cell.label)}
            onToggle={onToggle}
          />
        ))
      )}
    </div>
  );
}
