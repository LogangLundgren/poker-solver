# Poker Solver

A full-stack SaaS poker equity calculator supporting No Limit Hold'em and Pot Limit Omaha. Input hands or ranges, get real-time equity breakdowns across all streets.

## Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui → Vercel
- **Solver API:** Python 3.11, FastAPI, treys, NumPy → Railway
- **Database:** Supabase (PostgreSQL + Auth)
- **Payments:** Stripe

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- Supabase account
- Railway account

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

## Environment Variables

See `.env.example` in each service directory.

## Development

This project uses Claude Flow for multi-agent AI-assisted development.

See [CLAUDE.md](./CLAUDE.md) for agent roles and conventions.  
See [PHASES.md](./PHASES.md) for build plan and phase status.  
See [DECISIONS.md](./DECISIONS.md) for architecture decisions.  
See [COMPONENTS.md](./COMPONENTS.md) for component inventory.

## License

MIT
