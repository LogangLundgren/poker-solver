from fastapi import APIRouter, HTTPException
from app.models.equity import EquityRequest, EquityResponse, PlayerResult
from app.services.equity_calculator import calculate_equity as _calculate_equity
from app.core.config import settings

router = APIRouter(tags=["equity"])


@router.post("/equity", response_model=EquityResponse)
def calculate_equity(req: EquityRequest) -> EquityResponse:
    """Calculate equity for a set of hands/ranges."""
    iterations = req.iterations or settings.monte_carlo_default_iterations

    try:
        players_dicts = [p.model_dump(exclude_none=True) for p in req.players]
        result = _calculate_equity(
            players=players_dicts,
            board=req.board,
            iterations=iterations,
            format=req.format,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return EquityResponse(
        players=[PlayerResult(**p) for p in result["players"]],
        total_boards=result["total_boards"],
        method=result["method"],
        iterations=result["iterations"],
        elapsed_ms=result["elapsed_ms"],
    )
