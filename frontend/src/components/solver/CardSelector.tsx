"use client";

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS = [
  { char: "h", symbol: "\u2665", color: "text-red-500" },
  { char: "d", symbol: "\u2666", color: "text-blue-400" },
  { char: "c", symbol: "\u2663", color: "text-green-400" },
  { char: "s", symbol: "\u2660", color: "text-gray-300" },
];

interface CardSelectorProps {
  onSelect: (card: string) => void;
  deadCards: Set<string>;
  onClose: () => void;
}

export default function CardSelector({ onSelect, deadCards, onClose }: CardSelectorProps) {
  return (
    <div className="absolute z-50 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">Select a card</span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white text-xs cursor-pointer"
        >
          &times;
        </button>
      </div>
      <div className="grid grid-cols-13 gap-[2px]">
        {SUITS.map((suit) =>
          RANKS.map((rank) => {
            const card = `${rank}${suit.char}`;
            const dead = deadCards.has(card);
            return (
              <button
                key={card}
                disabled={dead}
                onClick={() => { onSelect(card); onClose(); }}
                className={`
                  w-7 h-9 text-[10px] font-bold rounded border flex flex-col items-center justify-center
                  transition-colors cursor-pointer
                  ${dead
                    ? "bg-gray-800/30 border-gray-800 text-gray-700 cursor-not-allowed"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-500"
                  }
                `}
              >
                <span className={dead ? "text-gray-700" : "text-white"}>{rank}</span>
                <span className={dead ? "text-gray-700" : suit.color}>{suit.symbol}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
