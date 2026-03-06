# CLAUDE.md — Poker Solver

## Project Overview

**Poker Solver** is a standalone SaaS equity calculator supporting multiple poker formats (NLHE, PLO, and more). Users input hands or ranges and receive real-time equity breakdowns across all streets.

**Live URLs:**
- Frontend: (set after Vercel deploy)
- API: (set after Railway deploy)
- Supabase Project: (set after creation)

---

## Claude Flow Agent Roles

This project uses Claude Flow for multi-agent development. Agents operate in parallel where possible and hand off via shared context.

### Orchestrator
- Reads PHASES.md and assigns work to subagents
- Tracks phase completion in memory
- Resolves conflicts between agents
- Never writes code directly — delegates to specialists

### Architect Agent
- Owns system design decisions
- Updates DECISIONS.md with every significant choice
- Reviews PRs from other agents for structural integrity
- Enforces separation between frontend, backend, and DB layers

### Frontend Agent
- Owns `/frontend` directory exclusively
- Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Communicates with backend only via typed API client in `/frontend/src/lib/api.ts`
- Never writes Python or SQL

### Backend Agent
- Owns `/backend` directory exclusively
- Stack: FastAPI, Python 3.11+, `treys` library, NumPy
- Exposes typed REST endpoints; never touches frontend files
- Writes OpenAPI-compatible route handlers only

### Database Agent
- Owns `/supabase/migrations` exclusively
- Uses Supabase MCP for live schema access
- All schema changes go through numbered migration files
- Never modifies frontend or backend logic

### QA/Debug Agent
- Runs after each phase completes
- Writes and runs tests (pytest for backend, Vitest for frontend)
- Reports failures back to Orchestrator with reproduction steps
- Patches bugs directly if < 10 lines; escalates larger fixes

### DevOps Agent
- Manages `.github/workflows`, Vercel config, Railway config
- Sets up environment variables (documents them in `.env.example`)
- Runs only at phase boundaries, not mid-phase

---

## Project Structure

```
poker-solver/
├── CLAUDE.md              ← You are here
├── PHASES.md              ← Phase definitions and completion status
├── DECISIONS.md           ← Architecture decision log
├── COMPONENTS.md          ← Component inventory
├── frontend/              ← Next.js 14 app
│   ├── src/
│   │   ├── app/           ← App Router pages
│   │   ├── components/    ← React components
│   │   ├── lib/           ← API client, utilities, hooks
│   │   └── types/         ← Shared TypeScript types
│   ├── package.json
│   └── next.config.ts
├── backend/               ← FastAPI microservice
│   ├── app/
│   │   ├── routers/       ← Route handlers (/equity, /range, /health)
│   │   ├── services/      ← Solver logic (equity, Monte Carlo, hand eval)
│   │   ├── models/        ← Pydantic request/response models
│   │   └── core/          ← Config, dependencies
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
├── supabase/
│   └── migrations/        ← Numbered SQL migration files
└── .github/
    └── workflows/         ← CI/CD pipelines
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Solver API | Python 3.11, FastAPI, treys, NumPy |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Frontend Host | Vercel |
| API Host | Railway |

---

## Core Conventions

### API Communication
- All frontend↔backend calls go through `/frontend/src/lib/api.ts`
- Backend URL stored in `NEXT_PUBLIC_API_URL` env var
- All endpoints return `{ data, error }` shape
- Backend versioned under `/api/v1/`

### Environment Variables
- Never hardcode secrets
- All vars documented in `.env.example`
- Frontend vars prefixed with `NEXT_PUBLIC_` only when safe to expose

### TypeScript
- Strict mode enabled
- Shared types in `/frontend/src/types/index.ts`
- No `any` — use `unknown` and narrow

### Python
- Type hints on all function signatures
- Pydantic models for all request/response bodies
- Services are pure functions (no side effects in solver logic)

### Database
- All migrations in `/supabase/migrations/` as `001_description.sql`, `002_description.sql`, etc.
- RLS enabled on all tables
- Never expose service role key to frontend

### Git
- Branch per phase: `phase-1-foundation`, `phase-2-solver-engine`, etc.
- Commit format: `feat:`, `fix:`, `test:`, `chore:`
- PR required to merge to `main`

---

## Solver Engine Notes

### Hand Evaluation
- Use `treys` library for NLHE hand evaluation
- PLO requires custom evaluator (best 5 of 4 hole + 5 board, must use exactly 2 hole cards)
- Hand ranks: 1 (Royal Flush) → 7462 (worst high card)

### Equity Calculation Methods
- **Full enumeration**: ≤ 2 players, no board cards — exact, fast
- **Monte Carlo**: ranges with board, or 3+ players — sample 10k-50k runouts
- Target: < 500ms response for typical calculations

### Range Notation Standard
```
AA          → specific hand (6 combos)
KQs         → suited only (4 combos)
ATo         → offsuit only (12 combos)
ATs+        → ATs, AJs, AQs, AKs
JJ-99       → JJ, TT, 99
AQo+        → AQo, AKo
```

---

## Phase Completion Checklist

Before marking any phase done:
- [ ] All defined features implemented
- [ ] QA agent has run and passed
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No Python type errors (`mypy app/`)
- [ ] DECISIONS.md updated
- [ ] COMPONENTS.md updated
- [ ] `.env.example` updated if new vars added
- [ ] Deployed to staging and smoke tested

---

## Known Constraints

- Railway free tier: 500 hours/month — keep API lightweight
- Vercel hobby: serverless functions 10s timeout — long calcs go to Python API, not Next.js API routes
- Supabase free tier: 500MB DB, 2GB bandwidth
