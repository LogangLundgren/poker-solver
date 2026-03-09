"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayingCardFace, EmptyCardSlot } from "./PlayingCard";
import CardSelector from "./CardSelector";

const PLAYER_ACCENTS = [
  "border-blue-500/20 bg-blue-500/[0.02]",
  "border-red-500/20 bg-red-500/[0.02]",
  "border-amber-500/20 bg-amber-500/[0.02]",
  "border-purple-500/20 bg-purple-500/[0.02]",
  "border-pink-500/20 bg-pink-500/[0.02]",
  "border-cyan-500/20 bg-cyan-500/[0.02]",
];

const PLAYER_COLORS = [
  { dot: "bg-blue-400", text: "text-blue-400" },
  { dot: "bg-red-400", text: "text-red-400" },
  { dot: "bg-amber-400", text: "text-amber-400" },
  { dot: "bg-purple-400", text: "text-purple-400" },
  { dot: "bg-pink-400", text: "text-pink-400" },
  { dot: "bg-cyan-400", text: "text-cyan-400" },
];

interface PlayerSlotProps {
  index: number;
  hand: string | null;
  range: string;
  mode: "hand" | "range";
  onModeChange: (mode: "hand" | "range") => void;
  onHandChange: (hand: string | null) => void;
  onRangeChange: (range: string) => void;
  onRemove?: () => void;
  deadCards: Set<string>;
  equity?: number | null;
  holeCards?: number;
  disableRange?: boolean;
}

export default function PlayerSlot({
  index, hand, range, mode, onModeChange, onHandChange,
  onRangeChange, onRemove, deadCards, equity,
  holeCards = 2, disableRange = false,
}: PlayerSlotProps) {
  const [showPicker, setShowPicker] = useState<number | null>(null);
  const colors = PLAYER_COLORS[index % 6];

  const cards: (string | null)[] = [];
  for (let i = 0; i < holeCards; i++) {
    const start = i * 2;
    if (hand && start + 2 <= hand.length) {
      cards.push(hand.slice(start, start + 2));
    } else {
      cards.push(null);
    }
  }

  const handleCardSelect = (slot: number, card: string) => {
    const newCards = [...cards];
    newCards[slot] = card;
    const handStr = newCards.map((c) => c || "").join("");
    onHandChange(handStr || null);
    setShowPicker(null);
  };

  return (
    <div className={cn("glass-panel border p-4 animate-fade-in-up", PLAYER_ACCENTS[index % 6])}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-2.5 h-2.5 rounded-full", colors.dot)} />
          <span className="text-sm font-medium text-gray-300">Player {index + 1}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Equity display */}
          {equity != null && (
            <div className="animate-count-up">
              <span className={cn("text-xl font-bold tabular-nums", colors.text)}>
                {equity.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500 ml-0.5">%</span>
            </div>
          )}

          {/* Mode toggle */}
          {!disableRange && (
            <div className="flex rounded-lg overflow-hidden border border-white/[0.08] bg-white/[0.02]">
              <button
                onClick={() => { onModeChange("hand"); onRangeChange(""); }}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-medium cursor-pointer transition-all",
                  mode === "hand" ? "bg-white/[0.1] text-white" : "text-gray-500 hover:text-gray-300"
                )}
              >
                Hand
              </button>
              <button
                onClick={() => { onModeChange("range"); onHandChange(null); }}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-medium cursor-pointer transition-all",
                  mode === "range" ? "bg-white/[0.1] text-white" : "text-gray-500 hover:text-gray-300"
                )}
              >
                Range
              </button>
            </div>
          )}

          {/* Remove */}
          {onRemove && (
            <button
              onClick={onRemove}
              className="w-6 h-6 flex items-center justify-center rounded-md
                         text-gray-600 hover:text-red-400 hover:bg-red-500/10
                         transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cards / Range Input */}
      {mode === "hand" ? (
        <div className="flex items-center gap-2 flex-wrap">
          {cards.map((card, slot) => (
            <div key={slot} className="relative">
              {card ? (
                <PlayingCardFace
                  card={card}
                  size="sm"
                  onClick={() => setShowPicker(showPicker === slot ? null : slot)}
                />
              ) : (
                <EmptyCardSlot
                  size="sm"
                  onClick={() => setShowPicker(showPicker === slot ? null : slot)}
                />
              )}
              {showPicker === slot && (
                <CardSelector
                  onSelect={(c) => handleCardSelect(slot, c)}
                  deadCards={deadCards}
                  onClose={() => setShowPicker(null)}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={range}
          onChange={(e) => onRangeChange(e.target.value)}
          placeholder="e.g. JJ+,AKs"
          className="input-field"
        />
      )}
    </div>
  );
}
