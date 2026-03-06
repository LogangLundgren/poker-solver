from fastapi import APIRouter
from app.models.equity import EquityRequest, EquityResponse

router = APIRouter(tags=["equity"])


@router.post("/equity", response_model=EquityResponse)
def calculate_equity(req: EquityRequest) -> EquityResponse:
    """
    Calculate equity for a set of hands/ranges.
    Implemented in Phase 2.
    """
    # TODO: Phase 2 — implement solver engine
    raise NotImplementedError("Equity calculation not yet implemented. Coming in Phase 2.")
