"use client";

import { useState, useCallback, useMemo } from "react";
import BoardInput from "@/components/solver/BoardInput";
import PlayerSlot from "@/components/solver/PlayerSlot";
import EquityResults from "@/components/solver/EquityResults";
import { calculateEquity, type EquityResponse, type PlayerInput } from "@/lib/api";

type Format = "nlhe" | "plo4" | "plo5" | "plo6";

const FORMAT_HOLE_CARDS: Record<Format, number> = {
  nlhe: 2,
  plo4: 4,
  plo5: 5,
  plo6: 6,
};

const FORMAT_LABELS: Record<Format, string> = {
  nlhe: "NLHE",
  plo4: "PLO4",
  plo5: "PLO5",
  plo6: "PLO6",
};

interface PlayerState {
  mode: "hand" | "range";
  hand: string | null;
  range: string;
}

function encodeState(players: PlayerState[], board: (string | null)[], format: string): string {
  const p = players.map((pl) =>
    pl.mode === "hand" ? `h:${pl.hand || ""}` : `r:${pl.range}`
  ).join(";");
  const b = board.filter(Boolean).join(",");
  return btoa(`${format}|${p}|${b}`);
}

export default function CalculatorPage() {
  const [players, setPlayers] = useState<PlayerState[]>([
    { mode: "hand", hand: null, range: "" },
    { mode: "hand", hand: null, range: "" },
  ]);
  const [board, setBoard] = useState<(string | null)[]>([null, null, null, null, null]);
  const [format, setFormat] = useState<Format>("nlhe");
  const [result, setResult] = useState<EquityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  const holeCards = FORMAT_HOLE_CARDS[format];
  const isPlo = format !== "nlhe";

  // Collect all "dead" cards
  const deadCards = useMemo(() => {
    const dead = new Set<string>();
    for (const card of board) {
      if (card) dead.add(card);
    }
    for (const p of players) {
      if (p.mode === "hand" && p.hand) {
        for (let i = 0; i < p.hand.length; i += 2) {
          if (i + 2 <= p.hand.length) {
            dead.add(p.hand.slice(i, i + 2));
          }
        }
      }
    }
    return dead;
  }, [players, board]);

  const handleFormatChange = useCallback((newFormat: Format) => {
    setFormat(newFormat);
    // Reset hands when switching formats (different card count)
    setPlayers((prev) => prev.map((p) => ({ ...p, hand: null, range: "" })));
    setResult(null);
    setError(null);
  }, []);

  const updatePlayer = useCallback((idx: number, updates: Partial<PlayerState>) => {
    setPlayers((prev) => prev.map((p, i) => (i === idx ? { ...p, ...updates } : p)));
    setResult(null);
  }, []);

  const addPlayer = useCallback(() => {
    if (players.length < 6) {
      setPlayers((prev) => [...prev, { mode: "hand", hand: null, range: "" }]);
      setResult(null);
    }
  }, [players.length]);

  const removePlayer = useCallback((idx: number) => {
    if (players.length > 2) {
      setPlayers((prev) => prev.filter((_, i) => i !== idx));
      setResult(null);
    }
  }, [players.length]);

  const expectedHandLen = holeCards * 2;
  const canCalculate = players.every((p) => {
    if (p.mode === "hand") return p.hand && p.hand.length === expectedHandLen;
    return p.range.trim().length > 0;
  });

  const handleCalculate = useCallback(async () => {
    setLoading(true);
    setError(null);

    const playerInputs: PlayerInput[] = players.map((p) => {
      if (p.mode === "hand" && p.hand) return { hand: p.hand };
      return { range: p.range };
    });

    const boardCards = board.filter((c): c is string => c !== null);

    const res = await calculateEquity({
      players: playerInputs,
      board: boardCards.length > 0 ? boardCards : undefined,
      format,
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setResult(res.data);
    }
  }, [players, board, format]);

  const handleShare = useCallback(() => {
    const encoded = encodeState(players, board, format);
    const url = `${window.location.origin}/calculator?s=${encoded}`;
    navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }, [players, board, format]);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Equity Calculator</h1>
            <p className="text-sm text-gray-400 mt-1">
              Calculate hand vs hand or range vs range equity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="px-3 py-1.5 text-xs font-medium bg-gray-800 border border-gray-700 rounded-md text-gray-300 hover:text-white transition-colors">
              Home
            </a>
            <a href="/range-builder" className="px-3 py-1.5 text-xs font-medium bg-gray-800 border border-gray-700 rounded-md text-gray-300 hover:text-white transition-colors">
              Range Builder
            </a>
          </div>
        </div>

        {/* Format selector */}
        <div className="flex items-center gap-2 mb-6">
          {(["nlhe", "plo4", "plo5", "plo6"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFormatChange(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                format === f
                  ? "bg-primary text-black"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {FORMAT_LABELS[f]}
            </button>
          ))}
          {isPlo && (
            <span className="text-[10px] text-gray-500 ml-2">
              {holeCards} hole cards &middot; Must use exactly 2
            </span>
          )}
        </div>

        {/* Board */}
        <div className="mb-6">
          <BoardInput
            board={board}
            onBoardChange={(b) => { setBoard(b); setResult(null); }}
            deadCards={deadCards}
          />
        </div>

        {/* Players */}
        <div className="space-y-3 mb-6">
          {players.map((p, idx) => (
            <PlayerSlot
              key={`${format}-${idx}`}
              index={idx}
              hand={p.hand}
              range={p.range}
              mode={isPlo ? "hand" : p.mode}
              onModeChange={(mode) => updatePlayer(idx, { mode })}
              onHandChange={(hand) => updatePlayer(idx, { hand })}
              onRangeChange={(range) => updatePlayer(idx, { range })}
              onRemove={players.length > 2 ? () => removePlayer(idx) : undefined}
              deadCards={deadCards}
              equity={result?.players[idx]?.equity ?? null}
              holeCards={holeCards}
              disableRange={isPlo}
            />
          ))}

          {players.length < 6 && (
            <button
              onClick={addPlayer}
              className="w-full py-2 border border-dashed border-gray-700 rounded-lg text-sm
                         text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors cursor-pointer"
            >
              + Add Player ({players.length}/6)
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleCalculate}
            disabled={!canCalculate || loading}
            className="px-6 py-2.5 bg-primary text-black font-semibold rounded-md
                       hover:bg-primary/80 transition-colors disabled:opacity-40
                       disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Calculating...
              </span>
            ) : (
              "Calculate Equity"
            )}
          </button>
          <button
            onClick={handleShare}
            disabled={!canCalculate}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-md
                       hover:text-white transition-colors text-sm disabled:opacity-40
                       disabled:cursor-not-allowed cursor-pointer"
          >
            {shared ? "Copied!" : "Share"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && <EquityResults result={result} />}
      </div>
    </main>
  );
}
