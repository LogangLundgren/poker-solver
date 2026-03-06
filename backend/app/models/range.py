from pydantic import BaseModel, Field
from typing import List


class RangeParseRequest(BaseModel):
    range: str = Field(..., description="Range string e.g. 'JJ+,AKs,AQo'")


class RangeParseResponse(BaseModel):
    combos: List[List[str]] = Field(..., description="List of [card1, card2] pairs")
    count: int = Field(..., description="Total number of combos")
    percentage: float = Field(..., description="Percentage of all possible hands")
