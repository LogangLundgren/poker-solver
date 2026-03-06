"use client";

import { useState } from "react";
import CardSelector from "./CardSelector";

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  h: { symbol: "\u2665", color: "text-red-500" },
  d: { symbol: "\u2666", color: "text-blue-400" },
  c: { symbol: "\u2663", color: "text-green-400" },
  s: { symbol: "\u2660", color: "text-gray-300" },
};

interface PlayerSlotProps {
  index: number;
  hand: string | null;          // "AhKs" or null
  range: string;                // range string
  mode: "hand" | "range";
  onModeChange: (mode: "hand" | "range") => void;
  onHandChange: (hand: string | null) => void;
  onRangeChange: (range: string) => void;
  onRemove?: () => void;
  deadCards: Set<string>;
  equity?: number | null;
}

function MiniCard({ card }: { card: string }) {
  const rank = card[0];
  const suit = card[1];
  const suitInfo = SUIT_SYMBOLS[suit];
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white rounded text-xs font-bold">
      <span className="text-gray-900">{rank}</span>
      <span className={suitInfo.color}>{suitInfo.symbol}</span>
    </span>
  );
}

export default function PlayerSlot({
  index, hand, range, mode, onModeChange, onHandChange,
  onRangeChange, onRemove, deadCards, equity,
}: PlayerSlotProps) {
  const [showPicker, setShowPicker] = useState<0 | 1 | null>(null);

  const card1 = hand ? hand.slice(0, 2) : null;
  const card2 = hand ? hand.slice(2, 4) : null;

  const handleCardSelect = (slot: 0 | 1, card: string) => {
    if (slot === 0) {
      onHandChange(card + (card2 || ""));
    } else {
      onHandChange((card1 || "") + card);
    }
    setShowPicker(null);
  };

  const colors = [
    "border-blue-500/50 bg-blue-500/5",
    "border-red-500/50 bg-red-500/5",
    "border-yellow-500/50 bg-yellow-500/5",
    "border-purple-500/50 bg-purple-500/5",
    "border-pink-500/50 bg-pink-500/5",
    "border-cyan-500/50 bg-cyan-500/5",
  ];

  return (
    <div className={`border rounded-lg p-3 ${colors[index % 6]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">Player {index + 1}</span>
        <div className="flex items-center gap-2">
          {equity != null && (
            <span className="text-sm font-bold text-white">{equity.toFixed(1)}%</span>
          )}
          <div className="flex rounded-md overflow-hidden border border-gray-700">
            <button
              onClick={() => { onModeChange("hand"); onRangeChange(""); }}
              className={`px-2 py-0.5 text-[10px] cursor-pointer ${mode === "hand" ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-400"}`}
            >
              Hand
            </button>
            <button
              onClick={() => { onModeChange("range"); onHandChange(null); }}
              className={`px-2 py-0.5 text-[10px] cursor-pointer ${mode === "range" ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-400"}`}
            >
              Range
            </button>
          </div>
          {onRemove && (
            <button onClick={onRemove} className="text-gray-500 hover:text-red-400 text-xs cursor-pointer">
              &times;
            </button>
          )}
        </div>
      </div>

      {mode === "hand" ? (
        <div className="flex items-center gap-2">
          <div className="relative">
            {card1 ? (
              <button onClick={() => setShowPicker(0)} className="cursor-pointer">
                <MiniCard card={card1} />
              </button>
            ) : (
              <button
                onClick={() => setShowPicker(0)}
                className="px-3 py-1 border border-dashed border-gray-600 rounded text-xs text-gray-500
                           hover:border-gray-400 cursor-pointer"
              >
                Card 1
              </button>
            )}
            {showPicker === 0 && (
              <CardSelector
                onSelect={(c) => handleCardSelect(0, c)}
                deadCards={deadCards}
                onClose={() => setShowPicker(null)}
              />
            )}
          </div>
          <div className="relative">
            {card2 ? (
              <button onClick={() => setShowPicker(1)} className="cursor-pointer">
                <MiniCard card={card2} />
              </button>
            ) : (
              <button
                onClick={() => setShowPicker(1)}
                className="px-3 py-1 border border-dashed border-gray-600 rounded text-xs text-gray-500
                           hover:border-gray-400 cursor-pointer"
              >
                Card 2
              </button>
            )}
            {showPicker === 1 && (
              <CardSelector
                onSelect={(c) => handleCardSelect(1, c)}
                deadCards={deadCards}
                onClose={() => setShowPicker(null)}
              />
            )}
          </div>
        </div>
      ) : (
        <input
          type="text"
          value={range}
          onChange={(e) => onRangeChange(e.target.value)}
          placeholder="e.g. JJ+,AKs"
          className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs
                     text-white placeholder-gray-500 focus:outline-none focus:border-primary"
        />
      )}
    </div>
  );
}
