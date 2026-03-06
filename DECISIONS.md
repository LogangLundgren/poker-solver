# DECISIONS.md — Architecture Decision Log

All significant architecture decisions logged here with rationale. Updated by Architect Agent.

---

## ADR-001: Python Microservice for Solver Engine

**Date:** Project start  
**Status:** Accepted

**Decision:** Use a separate FastAPI (Python) microservice for the solver engine rather than implementing it in TypeScript/Node.js.

**Rationale:**
- `treys` library provides battle-tested hand evaluation in Python with no JS equivalent
- NumPy enables fast Monte Carlo vectorization
- Keeps compute-heavy logic isolated from UI concerns
- Can be scaled/optimized independently of the frontend

**Tradeoffs:** Two services to deploy and maintain vs. one.

---

## ADR-002: Next.js 14 App Router

**Date:** Project start  
**Status:** Accepted

**Decision:** Use Next.js 14 with App Router (not Pages Router).

**Rationale:** Consistent with Titan Fitness stack. RSC enables better performance for static parts of the UI. Well-supported by Vercel.

---

## ADR-003: Monte Carlo vs Full Enumeration

**Date:** Project start  
**Status:** Accepted

**Decision:** Use full enumeration when ≤ 2 players and board is not fully specified. Use Monte Carlo (20k iterations) for ranges and 3+ players.

**Rationale:** 
- Heads-up exact equity is computationally feasible (52 choose 2 = 1326 combos)
- With ranges and multiple players, full enumeration becomes exponential
- 20k iterations gives < 0.5% variance, acceptable for practical use

---

## ADR-004: Railway for Python API Hosting

**Date:** Project start  
**Status:** Accepted

**Decision:** Host FastAPI backend on Railway rather than Vercel serverless functions.

**Rationale:** Python solver requires persistent process (warm start), native library support (treys), and execution times potentially > 10s for large range calculations. Railway supports long-running Python processes cleanly.

---

## ADR-005: Supabase for Auth and Storage

**Date:** Project start  
**Status:** Accepted

**Decision:** Use Supabase for auth, user data, saved ranges, and calculation history.

**Rationale:** Consistent with Titan Fitness. Built-in RLS, OAuth, and SDK make SaaS auth patterns straightforward to implement.

---

_New decisions appended here as the project evolves._
