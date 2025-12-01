from datetime import date, datetime, time, timedelta
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.court import Court as CourtModel
from app.models.reservation import Reservation as ReservationModel
from app.schemas.report import OccupancyEntry, OccupancyReport, RevenueEntry, RevenueReport
from app.schemas.reservation import ReservationStatus
from app.services.schedules import (
    calculate_total_slots,
    get_schedule_windows,
    subtract_closures_from_windows,
)

router = APIRouter(prefix="/reports", tags=["reports"])


def daterange(date_from: date, date_to: date):
    current = date_from
    while current <= date_to:
        yield current
        current += timedelta(days=1)


@router.get("/occupancy", response_model=OccupancyReport)
def occupancy_report(
    date_from: date = Query(...),
    date_to: date = Query(...),
    slot_minutes: int = Query(60, gt=0),
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> OccupancyReport:
    if date_from > date_to:
        raise HTTPException(status_code=400, detail="date_from must be before date_to")

    courts = db.query(CourtModel).filter(CourtModel.is_active.is_(True)).all()
    total_slots_by_court: Dict[int, int] = {court.id: 0 for court in courts}

    for single_date in daterange(date_from, date_to):
        for court in courts:
            windows = get_schedule_windows(db, court.id, single_date)
            windows = subtract_closures_from_windows(db, court.id, windows)
            total_slots_by_court[court.id] += calculate_total_slots(windows, slot_minutes)

    range_start = datetime.combine(date_from, time.min)
    range_end = datetime.combine(date_to, time.max)

    reservations = (
        db.query(ReservationModel)
        .filter(
            ReservationModel.status == ReservationStatus.CONFIRMED.value,
            ReservationModel.start_time < range_end,
            ReservationModel.end_time > range_start,
        )
        .all()
    )

    booked_slots: Dict[int, int] = {court.id: 0 for court in courts}
    for reservation in reservations:
        overlap_start = max(reservation.start_time, range_start)
        overlap_end = min(reservation.end_time, range_end)
        duration_minutes = int((overlap_end - overlap_start).total_seconds() // 60)
        booked_slots[reservation.court_id] = booked_slots.get(reservation.court_id, 0) + duration_minutes // slot_minutes

    entries: List[OccupancyEntry] = []
    for court in courts:
        total_slots = total_slots_by_court.get(court.id, 0)
        booked = booked_slots.get(court.id, 0)
        occupancy_rate = (booked / total_slots) if total_slots else 0.0
        entries.append(
            OccupancyEntry(
                court_id=court.id,
                court_name=court.name,
                total_slots=total_slots,
                booked_slots=booked,
                occupancy_rate=round(occupancy_rate, 2),
            )
        )

    return OccupancyReport(date_from=date_from, date_to=date_to, slot_minutes=slot_minutes, courts=entries)


@router.get("/revenue", response_model=RevenueReport)
def revenue_report(
    date_from: date = Query(...),
    date_to: date = Query(...),
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> RevenueReport:
    if date_from > date_to:
        raise HTTPException(status_code=400, detail="date_from must be before date_to")

    range_start = datetime.combine(date_from, time.min)
    range_end = datetime.combine(date_to, time.max)

    reservations = (
        db.query(ReservationModel)
        .filter(
            ReservationModel.status == ReservationStatus.CONFIRMED.value,
            ReservationModel.start_time >= range_start,
            ReservationModel.end_time <= range_end,
        )
        .all()
    )

    revenues: Dict[int, RevenueEntry] = {}
    for reservation in reservations:
        entry = revenues.setdefault(
            reservation.court_id,
            RevenueEntry(court_id=reservation.court_id, court_name=f"Court {reservation.court_id}", reservations_count=0, revenue_cents=0),
        )
        entry.reservations_count += 1
        entry.revenue_cents += reservation.price_cents or 0

    courts = db.query(CourtModel).filter(CourtModel.id.in_(revenues.keys())).all()
    name_map = {court.id: court.name for court in courts}

    for entry in revenues.values():
        entry.court_name = name_map.get(entry.court_id, entry.court_name)

    return RevenueReport(date_from=date_from, date_to=date_to, courts=list(revenues.values()))
