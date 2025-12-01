from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, model_validator


class ReservationStatus(str, Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    PENDING = "pending"


class ReservationBase(BaseModel):
    court_id: int
    start_time: datetime
    end_time: datetime
    customer_name: str
    customer_phone: Optional[str] = None


class ReservationCreate(ReservationBase):
    user_id: Optional[int] = None

    @model_validator(mode="after")
    def end_after_start(cls, data: "ReservationCreate") -> "ReservationCreate":
        if data.end_time <= data.start_time:
            raise ValueError("end_time must be after start_time")
        return data


class Reservation(ReservationBase):
    id: int
    status: ReservationStatus
    user_id: Optional[int] = None
    price_cents: Optional[int] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AvailabilitySlot(BaseModel):
    start_time: datetime
    end_time: datetime
