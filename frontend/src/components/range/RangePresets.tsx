"use client";

import { PRESETS } from "@/lib/range";

interface RangePresetsProps {
  onSelect: (range: string) => void;
}

export default function RangePresets({ onSelect }: RangePresetsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.name}
          onClick={() => onSelect(preset.range)}
          className="px-3 py-1.5 text-xs font-medium bg-gray-800 border border-gray-700
                     rounded-md text-gray-300 hover:bg-gray-700 hover:text-white
                     transition-colors cursor-pointer"
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}
