from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class PlayerInput(BaseModel):
    hand: Optional[str] = Field(None, description="Specific hand e.g. 'AhKs' (NLHE) or 'AhKsQdJc' (PLO)")
    range: Optional[str] = Field(None, description="Range string e.g. 'JJ+,AKs' (NLHE only)")


class PlayerResult(BaseModel):
    equity: float = Field(..., description="Equity percentage 0-100")
    wins: int
    ties: int
    losses: int


class EquityRequest(BaseModel):
    players: List[PlayerInput] = Field(..., min_length=2, max_length=6)
    board: Optional[List[str]] = Field(None, description="Board cards e.g. ['Ah','Kd','2c']")
    format: Literal["nlhe", "plo4", "plo5", "plo6"] = "nlhe"
    iterations: Optional[int] = Field(None, ge=1000, le=100000)


class EquityResponse(BaseModel):
    players: List[PlayerResult]
    total_boards: int
    method: Literal["exact", "montecarlo"]
    iterations: int
    elapsed_ms: float
