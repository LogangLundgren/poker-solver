# COMPONENTS.md — Component Inventory

Tracks all frontend components and backend modules. Updated as they are built.

---

## Frontend Components

### Solver
| Component | Path | Status | Description |
|---|---|---|---|
| CardSelector | components/solver/CardSelector.tsx | `[ ]` | Visual 52-card picker |
| BoardInput | components/solver/BoardInput.tsx | `[ ]` | 0–5 community card inputs |
| PlayerSlot | components/solver/PlayerSlot.tsx | `[ ]` | Hand or range input per player |
| EquityResults | components/solver/EquityResults.tsx | `[ ]` | Results bar + breakdown |
| EquityCalculator | components/solver/EquityCalculator.tsx | `[ ]` | Root solver page component |

### Range Builder
| Component | Path | Status | Description |
|---|---|---|---|
| RangeMatrix | components/range/RangeMatrix.tsx | `[ ]` | 13x13 hand grid |
| RangeCell | components/range/RangeCell.tsx | `[ ]` | Individual grid cell |
| RangeInput | components/range/RangeInput.tsx | `[ ]` | Text input with range parsing |
| RangeDisplay | components/range/RangeDisplay.tsx | `[ ]` | Combo chips display |
| RangePresets | components/range/RangePresets.tsx | `[ ]` | Preset range buttons |

### UI / Shared
| Component | Path | Status | Description |
|---|---|---|---|
| Navbar | components/ui/Navbar.tsx | `[ ]` | Top nav with auth state |
| Footer | components/ui/Footer.tsx | `[ ]` | Site footer |
| PricingCard | components/ui/PricingCard.tsx | `[ ]` | Subscription tier card |

### Pages (App Router)
| Page | Path | Status |
|---|---|---|
| Landing | app/page.tsx | `[ ]` |
| Calculator | app/calculator/page.tsx | `[ ]` |
| Dashboard | app/dashboard/page.tsx | `[ ]` |
| Login | app/auth/login/page.tsx | `[ ]` |
| Signup | app/auth/signup/page.tsx | `[ ]` |
| Pricing | app/pricing/page.tsx | `[ ]` |
| Settings | app/settings/page.tsx | `[ ]` |

---

## Backend Modules

### Routers
| Router | Path | Status | Endpoints |
|---|---|---|---|
| equity | routers/equity.py | `[ ]` | POST /api/v1/equity |
| range | routers/range.py | `[ ]` | POST /api/v1/range/parse |
| health | routers/health.py | `[ ]` | GET /api/v1/health |

### Services
| Service | Path | Status | Description |
|---|---|---|---|
| hand_evaluator | services/hand_evaluator.py | `[ ]` | Wraps treys, NLHE eval |
| equity_calculator | services/equity_calculator.py | `[ ]` | Enumeration + Monte Carlo |
| range_parser | services/range_parser.py | `[ ]` | Range string → combos |
| plo_evaluator | services/plo_evaluator.py | `[ ]` | PLO hand evaluation |

### Models
| Model | Path | Status | Description |
|---|---|---|---|
| EquityRequest | models/equity.py | `[ ]` | POST /equity input |
| EquityResponse | models/equity.py | `[ ]` | POST /equity output |
| RangeRequest | models/range.py | `[ ]` | POST /range/parse input |
| RangeResponse | models/range.py | `[ ]` | POST /range/parse output |

---

## Database Tables

| Table | Migration | Status | Description |
|---|---|---|---|
| profiles | 001_init.sql | `[ ]` | User profile data |
| saved_ranges | 002_ranges.sql | `[ ]` | User's saved ranges |
| calculation_history | 003_history.sql | `[ ]` | Past equity calcs |
| subscriptions | 004_billing.sql | `[ ]` | Stripe subscription state |
