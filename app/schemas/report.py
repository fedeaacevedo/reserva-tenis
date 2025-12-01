from datetime import date
from typing import List

from pydantic import BaseModel


class OccupancyEntry(BaseModel):
    court_id: int
    court_name: str
    total_slots: int
    booked_slots: int
    occupancy_rate: float


class OccupancyReport(BaseModel):
    date_from: date
    date_to: date
    slot_minutes: int
    courts: List[OccupancyEntry]


class RevenueEntry(BaseModel):
    court_id: int
    court_name: str
    reservations_count: int
    revenue_cents: int


class RevenueReport(BaseModel):
    date_from: date
    date_to: date
    courts: List[RevenueEntry]
