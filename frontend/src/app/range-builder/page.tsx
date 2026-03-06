"use client";

import { useState, useCallback, useEffect } from "react";
import RangeMatrix from "@/components/range/RangeMatrix";
import RangeInput from "@/components/range/RangeInput";
import RangePresets from "@/components/range/RangePresets";
import RangeDisplay from "@/components/range/RangeDisplay";
import RangeSaveLoad from "@/components/range/RangeSaveLoad";
import {
  rangeStringToSelection,
  selectionToRangeString,
} from "@/lib/range";

export default function RangeBuilderPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [textInput, setTextInput] = useState("");
  const [syncing, setSyncing] = useState<"grid" | "text" | null>(null);

  // Grid → text sync
  useEffect(() => {
    if (syncing === "grid") {
      setTextInput(selectionToRangeString(selected));
      setSyncing(null);
    }
  }, [selected, syncing]);

  const handleToggle = useCallback((label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
    setSyncing("grid");
  }, []);

  // Text → grid sync
  const handleTextChange = useCallback((value: string) => {
    setTextInput(value);
    const newSelection = rangeStringToSelection(value);
    setSelected(newSelection);
  }, []);

  const handlePresetSelect = useCallback((range: string) => {
    setTextInput(range);
    setSelected(rangeStringToSelection(range));
  }, []);

  const handleLoadRange = useCallback((hands: string[]) => {
    const sel = new Set(hands);
    setSelected(sel);
    setTextInput(selectionToRangeString(sel));
  }, []);

  const handleClear = useCallback(() => {
    setSelected(new Set());
    setTextInput("");
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Range Builder</h1>
            <p className="text-sm text-gray-400 mt-1">
              Click cells or type notation to build your range
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/"
              className="px-3 py-1.5 text-xs font-medium bg-gray-800 border border-gray-700
                         rounded-md text-gray-300 hover:text-white transition-colors"
            >
              Home
            </a>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-xs font-medium bg-gray-800 border border-gray-700
                         rounded-md text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Left: Matrix */}
          <div className="space-y-4">
            <RangeMatrix selected={selected} onToggle={handleToggle} />

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600" />
                Pairs
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-600" />
                Suited
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-green-600" />
                Offsuit
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="space-y-6">
            <RangeInput value={textInput} onChange={handleTextChange} />

            <div>
              <p className="text-sm text-gray-400 mb-2">Presets</p>
              <RangePresets onSelect={handlePresetSelect} />
            </div>

            <RangeDisplay selected={selected} />

            <RangeSaveLoad selected={selected} onLoad={handleLoadRange} />
          </div>
        </div>
      </div>
    </main>
  );
}
