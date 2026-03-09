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
          className="px-3 py-1.5 text-xs font-medium bg-white/[0.04] border border-white/[0.06]
                     rounded-lg text-gray-400 hover:bg-white/[0.08] hover:text-white
                     transition-all duration-150 cursor-pointer"
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}
