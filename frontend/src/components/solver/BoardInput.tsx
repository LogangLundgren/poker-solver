"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { PlayingCardFace, EmptyCardSlot } from "./PlayingCard";
import CardSelector from "./CardSelector";

interface BoardInputProps {
  board: (string | null)[];
  onBoardChange: (board: (string | null)[]) => void;
  deadCards: Set<string>;
}

function BoardCardSlot({ card, onClick, onRemove, label }: {
  card: string | null;
  onClick: () => void;
  onRemove: () => void;
  label: string;
}) {
  if (card) {
    return (
      <div className="relative group">
        <PlayingCardFace card={card} size="md" onClick={onClick} />
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full
                     text-white items-center justify-center hidden group-hover:flex cursor-pointer
                     shadow-lg shadow-red-500/30 hover:bg-red-400 transition-colors"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  }
  return <EmptyCardSlot label={label} size="md" onClick={onClick} />;
}

export default function BoardInput({ board, onBoardChange, deadCards }: BoardInputProps) {
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const nextEmpty = board.findIndex((c) => c === null);

  const handleSelect = (idx: number, card: string) => {
    const newBoard = [...board];
    newBoard[idx] = card;
    onBoardChange(newBoard);
    setOpenSlot(null);
  };

  const handleRemove = (idx: number) => {
    const newBoard = [...board];
    for (let i = idx; i < 5; i++) newBoard[i] = null;
    onBoardChange(newBoard);
  };

  const toggleSlot = (idx: number, card: string | null) => {
    if (card || idx === nextEmpty) setOpenSlot(openSlot === idx ? null : idx);
  };

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="section-label">Community Cards</span>
        {board.some((c) => c !== null) && (
          <button
            onClick={() => onBoardChange([null, null, null, null, null])}
            className="btn-ghost text-[10px]"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Flop */}
        <div className="flex gap-1.5">
          {board.slice(0, 3).map((card, idx) => (
            <div key={idx} className="relative">
              <BoardCardSlot
                card={card}
                onClick={() => toggleSlot(idx, card)}
                onRemove={() => handleRemove(idx)}
                label="Flop"
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
        </div>

        <div className="w-px h-12 bg-white/[0.06] mx-1" />

        {/* Turn */}
        <div className="relative">
          <BoardCardSlot
            card={board[3]}
            onClick={() => toggleSlot(3, board[3])}
            onRemove={() => handleRemove(3)}
            label="Turn"
          />
          {openSlot === 3 && (
            <CardSelector
              onSelect={(c) => handleSelect(3, c)}
              deadCards={deadCards}
              onClose={() => setOpenSlot(null)}
            />
          )}
        </div>

        <div className="w-px h-12 bg-white/[0.06] mx-1" />

        {/* River */}
        <div className="relative">
          <BoardCardSlot
            card={board[4]}
            onClick={() => toggleSlot(4, board[4])}
            onRemove={() => handleRemove(4)}
            label="River"
          />
          {openSlot === 4 && (
            <CardSelector
              onSelect={(c) => handleSelect(4, c)}
              deadCards={deadCards}
              onClose={() => setOpenSlot(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
