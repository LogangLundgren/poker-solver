from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import health, equity, range_router

app = FastAPI(
    title="Poker Solver API",
    version="0.1.0",
    description="Equity calculator API for NLHE and PLO",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(equity.router, prefix="/api/v1")
app.include_router(range_router.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"service": "poker-solver-api", "version": "0.1.0"}
