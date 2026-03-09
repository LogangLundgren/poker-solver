"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Plus, Share2, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import BoardInput from "@/components/solver/BoardInput";
import PlayerSlot from "@/components/solver/PlayerSlot";
import EquityResults from "@/components/solver/EquityResults";
import { calculateEquity, type EquityResponse, type PlayerInput } from "@/lib/api";

type Format = "nlhe" | "plo4" | "plo5" | "plo6";

const FORMAT_HOLE_CARDS: Record<Format, number> = { nlhe: 2, plo4: 4, plo5: 5, plo6: 6 };

const FORMAT_DESCRIPTIONS: Record<Format, string> = {
  nlhe: "No Limit Hold'em — 2 hole cards",
  plo4: "Pot Limit Omaha — 4 hole cards, must use exactly 2",
  plo5: "PLO 5-Card — 5 hole cards, must use exactly 2",
  plo6: "PLO 6-Card — 6 hole cards, must use exactly 2",
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

  const deadCards = useMemo(() => {
    const dead = new Set<string>();
    for (const card of board) {
      if (card) dead.add(card);
    }
    for (const p of players) {
      if (p.mode === "hand" && p.hand) {
        for (let i = 0; i < p.hand.length; i += 2) {
          if (i + 2 <= p.hand.length) dead.add(p.hand.slice(i, i + 2));
        }
      }
    }
    return dead;
  }, [players, board]);

  const handleFormatChange = useCallback((newFormat: string) => {
    const f = newFormat as Format;
    setFormat(f);
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
    if (res.error) setError(res.error);
    else if (res.data) setResult(res.data);
  }, [players, board, format]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.metaKey && !e.ctrlKey && canCalculate && !loading) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") handleCalculate();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [canCalculate, loading, handleCalculate]);

  const handleShare = useCallback(() => {
    const encoded = encodeState(players, board, format);
    const url = `${window.location.origin}/calculator?s=${encoded}`;
    navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }, [players, board, format]);

  return (
    <TooltipProvider>
      <main className="min-h-[calc(100vh-3.5rem)] relative">
        {/* Subtle background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] glow-green opacity-30" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 relative">
          {/* Header + Format */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Equity Calculator</h1>
              <p className="text-sm text-gray-500 mt-1">{FORMAT_DESCRIPTIONS[format]}</p>
            </div>

            <Tabs value={format} onValueChange={handleFormatChange}>
              <TabsList className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
                {(["nlhe", "plo4", "plo5", "plo6"] as const).map((f) => (
                  <Tooltip key={f}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value={f}
                        className="text-xs rounded-lg px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                      >
                        {f.toUpperCase()}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-[hsl(240_10%_10%)] text-gray-300 border-white/10">
                      <p className="text-[11px]">{FORMAT_DESCRIPTIONS[f]}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            {/* Left: Players */}
            <div className="space-y-5">
              <span className="section-label">Players</span>

              <div className="space-y-3">
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
                    className="w-full py-3.5 border border-dashed border-white/[0.08] rounded-2xl text-sm
                               text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/[0.02]
                               transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Player ({players.length}/6)
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCalculate}
                  disabled={!canCalculate || loading}
                  className="btn-primary flex items-center gap-2.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Calculate Equity
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  disabled={!canCalculate}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  {shared ? "Copied!" : "Share"}
                </button>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-fade-in-up">
                  {error}
                </div>
              )}
            </div>

            {/* Right: Board + Results */}
            <div className="space-y-5">
              <span className="section-label">Board & Results</span>

              <BoardInput
                board={board}
                onBoardChange={(b) => { setBoard(b); setResult(null); }}
                deadCards={deadCards}
              />

              {result ? (
                <EquityResults result={result} />
              ) : (
                <div className="glass-panel p-10 flex flex-col items-center justify-center text-center min-h-[220px]">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                    <Play className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Select hands and click Calculate</p>
                  <p className="text-[11px] text-gray-600">or press Enter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}
