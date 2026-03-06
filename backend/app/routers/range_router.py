from fastapi import APIRouter
from app.models.range import RangeParseRequest, RangeParseResponse

router = APIRouter(tags=["range"])


@router.post("/range/parse", response_model=RangeParseResponse)
def parse_range(req: RangeParseRequest) -> RangeParseResponse:
    """
    Parse a range string into combos.
    Implemented in Phase 2.
    """
    # TODO: Phase 2 — implement range parser
    raise NotImplementedError("Range parsing not yet implemented. Coming in Phase 2.")
