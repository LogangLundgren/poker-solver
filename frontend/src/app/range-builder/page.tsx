"use client";

import { useState, useCallback, useEffect } from "react";
import { Eraser } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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

  useEffect(() => {
    if (syncing === "grid") {
      setTextInput(selectionToRangeString(selected));
      setSyncing(null);
    }
  }, [selected, syncing]);

  const handleToggle = useCallback((label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
    setSyncing("grid");
  }, []);

  const handleTextChange = useCallback((value: string) => {
    setTextInput(value);
    setSelected(rangeStringToSelection(value));
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
    <main className="min-h-[calc(100vh-3.5rem)] relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] glow-blue opacity-30" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Range Builder</h1>
            <p className="text-sm text-gray-500 mt-1">
              Click cells or type notation to build your range
            </p>
          </div>
          <button onClick={handleClear} className="btn-ghost flex items-center gap-1.5">
            <Eraser className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <div className="glass-panel p-5">
              <RangeMatrix selected={selected} onToggle={handleToggle} />
            </div>

            <div className="flex items-center gap-6 text-[11px] text-gray-500 px-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-600/80" />
                Pairs (6)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-rose-600/80" />
                Suited (4)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600/80" />
                Offsuit (12)
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-panel p-5 space-y-4">
              <RangeInput value={textInput} onChange={handleTextChange} />
              <Separator className="bg-white/[0.06]" />
              <RangeDisplay selected={selected} />
            </div>

            <div className="glass-panel p-5">
              <span className="section-label block mb-3">Presets</span>
              <RangePresets onSelect={handlePresetSelect} />
            </div>

            <div className="glass-panel p-5">
              <span className="section-label block mb-3">Saved Ranges</span>
              <RangeSaveLoad selected={selected} onLoad={handleLoadRange} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
