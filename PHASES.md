# PHASES.md — Poker Solver Build Plan

## Phase Status Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

---

## Phase 1 — Foundation & Scaffold `[ ]`

**Goal:** Working repo, both services running locally, CI/CD connected.

### Tasks
- [ ] Initialize Next.js 14 app in `/frontend` with TypeScript + Tailwind + shadcn/ui
- [ ] Initialize FastAPI app in `/backend` with Python 3.11
- [ ] Configure `CORS` on FastAPI to allow frontend origin
- [ ] Create `/api/v1/health` endpoint returning `{ status: "ok", version: "0.1.0" }`
- [ ] Frontend fetches `/health` and displays status on homepage
- [ ] Set up `.env.example` for both services
- [ ] Configure Vercel project (frontend)
- [ ] Configure Railway project (backend)
- [ ] Set up GitHub Actions: lint + typecheck on push
- [ ] Create Supabase project, connect to frontend via `@supabase/ssr`
- [ ] Write initial migration: `001_init.sql` (users, profiles tables)

### Acceptance Criteria
- `npm run dev` in `/frontend` serves app on :3000
- `uvicorn main:app --reload` in `/backend` serves API on :8000
- `/health` returns 200 from both local and deployed URLs
- GitHub Actions green on push to `main`

---

## Phase 2 — Core Solver Engine `[ ]`

**Goal:** Python backend can calculate accurate equity for hands and ranges.

### Tasks
- [ ] Install and configure `treys` for NLHE hand evaluation
- [ ] Implement `Card` and `Deck` abstractions in `/backend/app/core/cards.py`
- [ ] Implement full enumeration equity (heads-up, 0-5 board cards)
- [ ] Implement Monte Carlo equity simulation (configurable iterations, default 20k)
- [ ] Build range parser: convert range string → list of combos
  - Support: `AA`, `KQs`, `ATo`, `ATs+`, `JJ-99`, `AQo+`, `22+`
  - Return combo count and list of `[card1, card2]` pairs
- [ ] `POST /api/v1/equity` endpoint
  - Input: `{ players: [{ hand?: string, range?: string }], board?: string[], format: "nlhe" }`
  - Output: `{ players: [{ equity: float, wins: int, ties: int }], iterations: int, method: "exact"|"montecarlo" }`
- [ ] `POST /api/v1/range/parse` endpoint
  - Input: `{ range: string }`
  - Output: `{ combos: string[][], count: int, percentage: float }`
- [ ] Unit tests for: hand evaluator, range parser, equity calculator (pytest)
- [ ] Equity accuracy benchmark: verify against known values (e.g., AA vs KK preflop = ~82%)

### Acceptance Criteria
- AA vs KK equity: 81-83% (exact)
- AK vs 22 equity: 48-50% (exact)
- Range calc: `JJ+,AKs` = 34 combos
- Monte Carlo variance < 0.5% at 20k iterations
- All pytest tests passing

---

## Phase 3 — Range Builder UI `[ ]`

**Goal:** Users can build, visualize, and input ranges via a 13x13 grid.

### Tasks
- [ ] Build `RangeMatrix` component (13x13 grid, pocket pairs diagonal, suited upper, offsuit lower)
- [ ] Each cell shows: hand label, selected state, combo count on hover
- [ ] Click to toggle individual hands on/off
- [ ] Color coding: pair / suited / offsuit differentiated
- [ ] Range percentage display (X% of all hands)
- [ ] Text input syncs bidirectionally with grid (type `JJ+` → highlights grid)
- [ ] Preset ranges: "Open UTG", "Open BTN", "3-bet IP", "Calling Range" (GTO approximations)
- [ ] `RangeDisplay` component: shows selected combos as chips
- [ ] Save/load range (localStorage for now, Supabase in Phase 6)

### Acceptance Criteria
- Grid renders correctly on desktop and mobile
- Typing `QQ+,AKs,AQs` highlights correct 28 cells
- Combo count and % update live as hands are toggled
- Preset ranges load correctly

---

## Phase 4 — Equity Calculator UI `[ ]`

**Goal:** Full working equity calculator interface connected to the backend solver.

### Tasks
- [ ] `CardSelector` component (visual card picker — 4 suits × 13 ranks)
- [ ] `BoardInput` component (0–5 community cards, flop/turn/river labeled)
- [ ] `PlayerSlot` component (hand input OR range selector toggle)
- [ ] Support 2–6 player slots (add/remove players)
- [ ] `EquityResults` component: bar chart + percentage per player
- [ ] Win/Tie/Lose breakdown per player
- [ ] Loading state with progress indicator during calculation
- [ ] Error handling: dead cards, conflicting inputs, invalid ranges
- [ ] "Run It Out" animation (optional stretch)
- [ ] Format selector: NLHE / PLO toggle (PLO grayed out with "coming soon")
- [ ] Share button: generates URL with calc state encoded

### Acceptance Criteria
- Can calculate AA vs KK in < 1s
- Range vs range calc completes in < 3s
- Error shown clearly for invalid inputs (e.g., same card twice)
- Mobile responsive layout

---

## Phase 5 — PLO Support `[ ]`

**Goal:** Extend solver engine and UI to support Pot Limit Omaha.

### Tasks
- [ ] PLO hand evaluator: best 5-card hand using exactly 2 of 4 hole cards + exactly 3 board cards
- [ ] PLO range representation (4-card hands, different notation)
- [ ] `POST /api/v1/equity` — extend to accept `format: "plo"`
- [ ] Monte Carlo only for PLO (full enumeration too expensive)
- [ ] PLO `CardSelector`: pick 4 hole cards
- [ ] PLO equity results display
- [ ] Omaha Hi/Lo toggle (optional stretch)

### Acceptance Criteria
- AsKsQsJs vs 2c2d2h2s on dry board ≈ correct equity
- PLO calculations complete in < 5s via Monte Carlo
- UI clearly labeled as PLO mode

---

## Phase 6 — Auth & SaaS Layer `[ ]`

**Goal:** User accounts, saved ranges, Stripe subscriptions, usage limits.

### Tasks
- [ ] Supabase Auth: email/password + Google OAuth
- [ ] Protected routes in Next.js (middleware)
- [ ] User profile page
- [ ] Saved Ranges feature:
  - Free tier: 5 saved ranges
  - Pro tier: unlimited
- [ ] Calculation History: last 50 calcs stored per user
- [ ] Stripe integration:
  - Free tier (default)
  - Pro tier: $9/month or $79/year
- [ ] Usage limits: Free tier rate-limited to 20 calcs/day
- [ ] Billing portal (Stripe Customer Portal)
- [ ] Supabase migrations for: saved_ranges, calculation_history, subscriptions

### Acceptance Criteria
- User can sign up, log in, log out
- Saved ranges persist across sessions
- Stripe checkout flow completes
- Exceeding free tier limits shows upgrade prompt
- RLS enforced: users can only see their own data

---

## Phase 7 — Polish & Advanced Features `[ ]`

**Goal:** Production-ready, differentiated product.

### Tasks
- [ ] EV calculator: pot equity + fold equity = total EV
- [ ] Preflop GTO charts (raise/call/fold % by position)
- [ ] Range export: copy as text, export as PNG
- [ ] Embed widget: `<iframe>` embeddable calculator for poker coaches
- [ ] Landing page: hero, features, pricing, testimonials
- [ ] SEO: metadata, sitemap, OG images
- [ ] Performance: API response caching (Redis or in-memory LRU)
- [ ] Analytics: Posthog or Plausible integration
- [ ] Error monitoring: Sentry

### Acceptance Criteria
- Lighthouse score > 90 on landing page
- API cached responses return in < 50ms
- All Phase 7 features tested and deployed

---

## Post-MVP Roadmap (Not in scope yet)

- GTO solver (CFR algorithm) — major undertaking, separate project
- Hand history import + analysis
- Multi-table tournament ICM calculations
- Mobile app (React Native)
- API access tier for developers
