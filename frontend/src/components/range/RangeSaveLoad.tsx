"use client";

import { useState, useEffect } from "react";
import { loadSavedRanges, saveRange, deleteRange, type SavedRange } from "@/lib/range";

interface RangeSaveLoadProps {
  selected: Set<string>;
  onLoad: (hands: string[]) => void;
}

export default function RangeSaveLoad({ selected, onLoad }: RangeSaveLoadProps) {
  const [savedRanges, setSavedRanges] = useState<SavedRange[]>([]);
  const [saveName, setSaveName] = useState("");
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    setSavedRanges(loadSavedRanges());
  }, []);

  const handleSave = () => {
    if (!saveName.trim()) return;
    saveRange(saveName.trim(), Array.from(selected));
    setSavedRanges(loadSavedRanges());
    setSaveName("");
    setShowSave(false);
  };

  const handleDelete = (name: string) => {
    deleteRange(name);
    setSavedRanges(loadSavedRanges());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSave(!showSave)}
          disabled={selected.size === 0}
          className="px-3 py-1.5 text-xs font-medium bg-primary/20 border border-primary/30
                     rounded-md text-primary hover:bg-primary/30 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Save Range
        </button>
      </div>

      {showSave && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Range name..."
            className="flex-1 px-3 py-1.5 text-xs bg-gray-800 border border-gray-700
                       rounded-md text-white placeholder-gray-500 focus:outline-none
                       focus:border-primary"
          />
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs font-medium bg-primary text-black
                       rounded-md hover:bg-primary/80 cursor-pointer"
          >
            Save
          </button>
        </div>
      )}

      {savedRanges.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Saved Ranges</p>
          {savedRanges.map((r) => (
            <div key={r.name} className="flex items-center justify-between gap-2 py-1">
              <button
                onClick={() => onLoad(r.hands)}
                className="text-xs text-gray-300 hover:text-white truncate cursor-pointer"
              >
                {r.name} ({r.hands.length} hands)
              </button>
              <button
                onClick={() => handleDelete(r.name)}
                className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
