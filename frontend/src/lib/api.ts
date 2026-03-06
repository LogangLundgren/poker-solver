const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };

async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const err = await res.text();
      return { data: null, error: err || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

// --- Types ---

export interface PlayerInput {
  hand?: string;    // e.g. "AhKs" — specific hand
  range?: string;   // e.g. "JJ+,AKs" — range string
}

export interface PlayerResult {
  equity: number;
  wins: number;
  ties: number;
  losses: number;
}

export interface EquityRequest {
  players: PlayerInput[];
  board?: string[];  // e.g. ["Ah", "Kd", "2c"]
  format?: "nlhe" | "plo4" | "plo5" | "plo6";
  iterations?: number;
}

export interface EquityResponse {
  players: PlayerResult[];
  total_boards: number;
  method: "exact" | "montecarlo";
  iterations: number;
  elapsed_ms: number;
}

export interface RangeParseRequest {
  range: string;
}

export interface RangeParseResponse {
  combos: string[][];
  count: number;
  percentage: number;
}

// --- API calls ---

export async function calculateEquity(req: EquityRequest) {
  return apiRequest<EquityResponse>("/api/v1/equity", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function parseRange(req: RangeParseRequest) {
  return apiRequest<RangeParseResponse>("/api/v1/range/parse", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function healthCheck() {
  return apiRequest<{ status: string; version: string }>("/api/v1/health");
}
