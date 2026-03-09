"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS = [
  { char: "h", symbol: "\u2665", cls: "suit-hearts" },
  { char: "d", symbol: "\u2666", cls: "suit-diamonds" },
  { char: "c", symbol: "\u2663", cls: "suit-clubs" },
  { char: "s", symbol: "\u2660", cls: "suit-spades" },
];

interface CardSelectorProps {
  onSelect: (card: string) => void;
  deadCards: Set<string>;
  onClose: () => void;
}

export default function CardSelector({ onSelect, deadCards, onClose }: CardSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-2 glass-panel-elevated p-3 animate-fade-in-up"
    >
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="section-label">Pick a card</span>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded-md text-gray-500
                     hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Suit labels */}
      <div className="grid grid-cols-13 gap-[3px]">
        {SUITS.map((suit) =>
          RANKS.map((rank) => {
            const card = `${rank}${suit.char}`;
            const dead = deadCards.has(card);
            return (
              <button
                key={card}
                disabled={dead}
                onClick={() => onSelect(card)}
                className="card-grid-btn"
              >
                <span className={dead ? "text-gray-700" : "text-gray-800 text-[11px]"}>
                  {rank}
                </span>
                <span className={dead ? "text-gray-700" : `${suit.cls} text-[10px] leading-none`}>
                  {suit.symbol}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
