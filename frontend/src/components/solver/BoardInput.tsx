"use client";

import { useState } from "react";
import CardSelector from "./CardSelector";

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  h: { symbol: "\u2665", color: "text-red-500" },
  d: { symbol: "\u2666", color: "text-blue-400" },
  c: { symbol: "\u2663", color: "text-green-400" },
  s: { symbol: "\u2660", color: "text-gray-300" },
};

interface BoardInputProps {
  board: (string | null)[];
  onBoardChange: (board: (string | null)[]) => void;
  deadCards: Set<string>;
}

function CardDisplay({ card, onClick, onRemove, label }: {
  card: string | null;
  onClick: () => void;
  onRemove: () => void;
  label: string;
}) {
  if (card) {
    const rank = card[0];
    const suit = card[1];
    const suitInfo = SUIT_SYMBOLS[suit];
    return (
      <div className="relative group">
        <button
          onClick={onClick}
          className="w-12 h-16 bg-white rounded-md border-2 border-gray-300 flex flex-col items-center
                     justify-center shadow-sm hover:border-primary transition-colors cursor-pointer"
        >
          <span className="text-sm font-bold text-gray-900">{rank}</span>
          <span className={`text-lg ${suitInfo.color}`}>{suitInfo.symbol}</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px]
                     text-white items-center justify-center hidden group-hover:flex cursor-pointer"
        >
          &times;
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className="w-12 h-16 border-2 border-dashed border-gray-700 rounded-md flex items-center
                 justify-center text-gray-600 hover:border-gray-500 hover:text-gray-400
                 transition-colors cursor-pointer"
    >
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

export default function BoardInput({ board, onBoardChange, deadCards }: BoardInputProps) {
  const [openSlot, setOpenSlot] = useState<number | null>(null);

  const labels = ["Flop", "Flop", "Flop", "Turn", "River"];

  const handleSelect = (idx: number, card: string) => {
    const newBoard = [...board];
    newBoard[idx] = card;
    onBoardChange(newBoard);
    setOpenSlot(null);
  };

  const handleRemove = (idx: number) => {
    const newBoard = [...board];
    // Remove this and all cards after it
    for (let i = idx; i < 5; i++) newBoard[i] = null;
    onBoardChange(newBoard);
  };

  // Only allow selecting the next empty slot in order
  const nextEmpty = board.findIndex((c) => c === null);

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">Board</label>
      <div className="flex items-center gap-2">
        {board.map((card, idx) => (
          <div key={idx} className="relative">
            <CardDisplay
              card={card}
              onClick={() => {
                if (card || idx === nextEmpty) setOpenSlot(openSlot === idx ? null : idx);
              }}
              onRemove={() => handleRemove(idx)}
              label={labels[idx]}
            />
            {openSlot === idx && (
              <CardSelector
                onSelect={(c) => handleSelect(idx, c)}
                deadCards={deadCards}
                onClose={() => setOpenSlot(null)}
              />
            )}
          </div>
        ))}
        {board.some((c) => c !== null) && (
          <button
            onClick={() => onBoardChange([null, null, null, null, null])}
            className="text-xs text-gray-500 hover:text-gray-300 ml-2 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
