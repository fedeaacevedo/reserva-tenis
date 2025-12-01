from datetime import time
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, conint


class ScheduleBase(BaseModel):
    court_id: Optional[int] = Field(default=None, description="Null applies to all courts")
    day_of_week: conint(ge=0, le=6)  # type: ignore[arg-type]
    open_time: time
    close_time: time
    is_active: bool = True


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    court_id: Optional[int] = None
    day_of_week: Optional[int] = None
    open_time: Optional[time] = None
    close_time: Optional[time] = None
    is_active: Optional[bool] = None


class Schedule(ScheduleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TariffBase(BaseModel):
    court_id: Optional[int] = None
    day_of_week: Optional[conint(ge=0, le=6)] = None  # type: ignore[arg-type]
    start_time: time
    end_time: time
    price_per_hour_cents: int
    is_active: bool = True


class TariffCreate(TariffBase):
    pass


class TariffUpdate(BaseModel):
    court_id: Optional[int] = None
    day_of_week: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    price_per_hour_cents: Optional[int] = None
    is_active: Optional[bool] = None


class Tariff(TariffBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
