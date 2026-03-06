/**
 * Range utility library for the 13x13 hand matrix.
 *
 * Grid layout:
 * - Rows = first rank (high card), Columns = second rank
 * - Diagonal = pocket pairs (AA, KK, ..., 22)
 * - Above diagonal = suited hands
 * - Below diagonal = offsuit hands
 */

export const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
export type Rank = (typeof RANKS)[number];

export type HandType = "pair" | "suited" | "offsuit";

export interface HandCell {
  label: string;       // e.g. "AKs", "AA", "T9o"
  row: number;         // 0-12
  col: number;         // 0-12
  type: HandType;
  combos: number;      // 6 for pairs, 4 for suited, 12 for offsuit
  rank1: Rank;         // higher rank
  rank2: Rank;         // lower rank
}

/** Build the 13x13 grid of hand cells. */
export function buildGrid(): HandCell[][] {
  const grid: HandCell[][] = [];
  for (let row = 0; row < 13; row++) {
    const cells: HandCell[] = [];
    for (let col = 0; col < 13; col++) {
      const r1 = RANKS[row];
      const r2 = RANKS[col];
      let type: HandType;
      let label: string;
      let combos: number;

      if (row === col) {
        type = "pair";
        label = `${r1}${r2}`;
        combos = 6;
      } else if (row < col) {
        type = "suited";
        label = `${r1}${r2}s`;
        combos = 4;
      } else {
        type = "offsuit";
        label = `${r2}${r1}o`;
        combos = 12;
      }

      cells.push({ label, row, col, type, combos, rank1: RANKS[Math.min(row, col)], rank2: RANKS[Math.max(row, col)] });
    }
    grid.push(cells);
  }
  return grid;
}

/** Total possible starting hand combos. */
export const TOTAL_COMBOS = 1326;

/** Convert a set of selected hand labels to combo count. */
export function countCombos(selected: Set<string>): number {
  const grid = buildGrid();
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (selected.has(cell.label)) {
        count += cell.combos;
      }
    }
  }
  return count;
}

/** Convert combo count to percentage of all hands. */
export function combosToPercent(combos: number): number {
  return Math.round((combos / TOTAL_COMBOS) * 1000) / 10;
}

// --- Range string ↔ Grid selection mapping ---

const RANK_ORDER = "AKQJT98765432";

function rankIndex(r: string): number {
  return RANK_ORDER.indexOf(r);
}

/** Parse a range string into a set of hand labels (grid cell labels). */
export function rangeStringToSelection(rangeStr: string): Set<string> {
  const selected = new Set<string>();
  if (!rangeStr.trim()) return selected;

  const tokens = rangeStr.split(",").map((t) => t.trim()).filter(Boolean);

  for (const token of tokens) {
    try {
      const hands = parseToken(token);
      for (const h of hands) selected.add(h);
    } catch {
      // Skip invalid tokens
    }
  }
  return selected;
}

function parseToken(token: string): string[] {
  // Dash range
  if (token.includes("-")) {
    const [left, right] = token.split("-").map((s) => s.trim());
    return parseDashRange(left, right);
  }
  // Plus notation
  if (token.endsWith("+")) {
    return parsePlus(token.slice(0, -1));
  }
  // Single hand
  return [normalizeHand(token)];
}

function normalizeHand(h: string): string {
  if (h.length === 2) {
    const [r1, r2] = [h[0], h[1]];
    if (r1 === r2) return `${r1}${r2}`;
    const [hi, lo] = rankIndex(r1) < rankIndex(r2) ? [r1, r2] : [r2, r1];
    return `${hi}${lo}`;  // unspecified — we'll add both suited and offsuit
  }
  if (h.length === 3) {
    const [r1, r2, q] = [h[0], h[1], h[2]];
    const [hi, lo] = rankIndex(r1) < rankIndex(r2) ? [r1, r2] : [r2, r1];
    return `${hi}${lo}${q}`;
  }
  return h;
}

function parsePlus(base: string): string[] {
  const results: string[] = [];
  if (base.length === 2) {
    const [r1, r2] = [base[0], base[1]];
    if (r1 === r2) {
      // Pair plus: JJ+ → JJ, QQ, KK, AA
      const idx = rankIndex(r1);
      for (let i = idx; i >= 0; i--) {
        results.push(`${RANK_ORDER[i]}${RANK_ORDER[i]}`);
      }
    } else {
      // Unspecified plus — add both suited and offsuit
      const [hi, lo] = rankIndex(r1) < rankIndex(r2) ? [r1, r2] : [r2, r1];
      const hiIdx = rankIndex(hi);
      const loIdx = rankIndex(lo);
      for (let i = loIdx; i > hiIdx; i--) {
        results.push(`${hi}${RANK_ORDER[i]}s`);
        results.push(`${hi}${RANK_ORDER[i]}o`);
      }
    }
  } else if (base.length === 3) {
    const [r1, r2, q] = [base[0], base[1], base[2]];
    const [hi, lo] = rankIndex(r1) < rankIndex(r2) ? [r1, r2] : [r2, r1];
    const hiIdx = rankIndex(hi);
    const loIdx = rankIndex(lo);
    for (let i = loIdx; i > hiIdx; i--) {
      results.push(`${hi}${RANK_ORDER[i]}${q}`);
    }
  }
  return results;
}

function parseDashRange(left: string, right: string): string[] {
  const results: string[] = [];

  // Pair range: JJ-99
  if (left.length === 2 && left[0] === left[1] && right.length === 2 && right[0] === right[1]) {
    let hiIdx = rankIndex(left[0]);
    let loIdx = rankIndex(right[0]);
    if (hiIdx > loIdx) [hiIdx, loIdx] = [loIdx, hiIdx];
    for (let i = hiIdx; i <= loIdx; i++) {
      results.push(`${RANK_ORDER[i]}${RANK_ORDER[i]}`);
    }
    return results;
  }

  // Suited/offsuit range: KTs-K8s
  const leftQ = left.length === 3 ? left[2] : null;
  const rightQ = right.length === 3 ? right[2] : null;
  const q = leftQ || rightQ;

  const lHi = rankIndex(left[0]) < rankIndex(left[1]) ? left[0] : left[1];
  const lLo = rankIndex(left[0]) < rankIndex(left[1]) ? left[1] : left[0];
  const rLo = rankIndex(right[0]) < rankIndex(right[1]) ? right[1] : right[0];

  let topIdx = rankIndex(lLo);
  let botIdx = rankIndex(rLo);
  if (topIdx > botIdx) [topIdx, botIdx] = [botIdx, topIdx];

  for (let i = topIdx; i <= botIdx; i++) {
    if (q) {
      results.push(`${lHi}${RANK_ORDER[i]}${q}`);
    } else {
      results.push(`${lHi}${RANK_ORDER[i]}s`);
      results.push(`${lHi}${RANK_ORDER[i]}o`);
    }
  }
  return results;
}

/** Convert a set of selected hand labels back to a compact range string. */
export function selectionToRangeString(selected: Set<string>): string {
  if (selected.size === 0) return "";
  // Simple approach: just list all selected hands comma-separated
  // A more advanced version could compress (e.g., detect JJ+ patterns)
  const sorted = Array.from(selected).sort((a, b) => {
    const ai = rankIndex(a[0]) * 100 + rankIndex(a[1]);
    const bi = rankIndex(b[0]) * 100 + rankIndex(b[1]);
    return ai - bi;
  });
  return sorted.join(",");
}

// --- Preset Ranges (GTO approximations) ---

export interface RangePreset {
  name: string;
  range: string;
}

export const PRESETS: RangePreset[] = [
  {
    name: "Open UTG",
    range: "AA,KK,QQ,JJ,TT,99,88,77,AKs,AQs,AJs,ATs,A5s,A4s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,87s,AKo,AQo,AJo,KQo",
  },
  {
    name: "Open BTN",
    range: "AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KJs,KTs,K9s,K8s,K7s,K6s,QJs,QTs,Q9s,Q8s,JTs,J9s,J8s,T9s,T8s,98s,97s,87s,86s,76s,75s,65s,64s,54s,53s,43s,AKo,AQo,AJo,ATo,A9o,A8o,KQo,KJo,KTo,K9o,QJo,QTo,Q9o,JTo,J9o,T9o,98o,87o",
  },
  {
    name: "3-Bet IP",
    range: "AA,KK,QQ,JJ,TT,AKs,AQs,AJs,A5s,A4s,KQs,AKo,AQo",
  },
  {
    name: "Calling Range",
    range: "JJ,TT,99,88,77,66,AJs,ATs,A9s,A8s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,87s,76s,65s,AJo,ATo,KQo,KJo,QJo",
  },
];

// --- localStorage persistence ---

const STORAGE_KEY = "poker-solver-saved-ranges";

export interface SavedRange {
  name: string;
  hands: string[];  // array of hand labels
  createdAt: string;
}

export function loadSavedRanges(): SavedRange[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRange(name: string, hands: string[]): void {
  const ranges = loadSavedRanges();
  const existing = ranges.findIndex((r) => r.name === name);
  const entry: SavedRange = { name, hands, createdAt: new Date().toISOString() };
  if (existing >= 0) {
    ranges[existing] = entry;
  } else {
    ranges.push(entry);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
}

export function deleteRange(name: string): void {
  const ranges = loadSavedRanges().filter((r) => r.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
}
