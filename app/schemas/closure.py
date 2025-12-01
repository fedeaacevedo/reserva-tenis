from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ClosureBase(BaseModel):
    start_time: datetime = Field(..., description="Start of the blocked period")
    end_time: datetime = Field(..., description="End of the blocked period")
    court_id: Optional[int] = Field(
        default=None, description="If omitted, closure applies to all courts"
    )
    reason: Optional[str] = None

    @model_validator(mode="after")
    def validate_window(cls, values: "ClosureBase") -> "ClosureBase":
        if values.end_time <= values.start_time:
            raise ValueError("end_time must be after start_time")
        return values


class ClosureCreate(ClosureBase):
    pass


class ClosureUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    court_id: Optional[int] = None
    reason: Optional[str] = None

    @model_validator(mode="after")
    def validate_window(cls, values: "ClosureUpdate") -> "ClosureUpdate":
        if values.start_time and values.end_time and values.end_time <= values.start_time:
            raise ValueError("end_time must be after start_time")
        return values


class Closure(ClosureBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
