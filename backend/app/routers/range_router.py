from fastapi import APIRouter
from app.models.range import RangeParseRequest, RangeParseResponse
from app.services.range_parser import parse_range as _parse_range, get_range_percentage

router = APIRouter(tags=["range"])


@router.post("/range/parse", response_model=RangeParseResponse)
def parse_range(req: RangeParseRequest) -> RangeParseResponse:
    """Parse a range string into its constituent combos."""
    combos = _parse_range(req.range)
    combo_lists = [list(c) for c in combos]
    return RangeParseResponse(
        combos=combo_lists,
        count=len(combo_lists),
        percentage=get_range_percentage(req.range),
    )
