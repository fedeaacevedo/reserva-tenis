from datetime import date, datetime, time, timedelta
from typing import List, Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.api import deps
from app.models.court import Court as CourtModel
from app.models.reservation import Reservation as ReservationModel
from app.schemas.court import Court, CourtCreate, CourtUpdate
from app.schemas.reservation import AvailabilitySlot, ReservationStatus
from app.services.reservations import expire_lapsed_reservations
from app.services.schedules import (
    get_schedule_windows,
    subtract_closures_from_windows,
)

router = APIRouter(prefix="/courts", tags=["courts"])


@router.post("/", response_model=Court, status_code=status.HTTP_201_CREATED)
def create_court(
    court_in: CourtCreate,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> CourtModel:
    court = CourtModel(**court_in.model_dump())
    db.add(court)
    db.commit()
    db.refresh(court)
    return court


@router.get("/", response_model=List[Court])
def list_courts(db: Session = Depends(deps.get_db_session)) -> List[CourtModel]:
    return (
        db.query(CourtModel)
        .filter(CourtModel.is_active.is_(True))
        .order_by(CourtModel.name)
        .all()
    )


@router.get("/{court_id}", response_model=Court)
def get_court(court_id: int, db: Session = Depends(deps.get_db_session)) -> CourtModel:
    court = db.get(CourtModel, court_id)
    if not court:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Court not found")
    return court


@router.put("/{court_id}", response_model=Court)
def update_court(
    court_id: int,
    court_in: CourtUpdate,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> CourtModel:
    court = db.get(CourtModel, court_id)
    if not court:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Court not found")

    update_data = court_in.model_dump(exclude_unset=True)
    if not update_data:
        return court

    for field, value in update_data.items():
        setattr(court, field, value)

    db.commit()
    db.refresh(court)
    return court


@router.delete("/{court_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_court(
    court_id: int,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> Response:
    court = db.get(CourtModel, court_id)
    if not court:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Court not found")

    court.is_active = False
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{court_id}/availability", response_model=List[AvailabilitySlot])
def court_availability(
    court_id: int,
    query_date: date = Query(..., alias="date"),
    slot_minutes: int = 60,
    from_hour: Optional[int] = Query(default=None),
    to_hour: Optional[int] = Query(default=None),
    db: Session = Depends(deps.get_db_session),
) -> List[AvailabilitySlot]:
    if slot_minutes <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="slot_minutes must be positive")
    if (from_hour is not None) ^ (to_hour is not None):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="from_hour and to_hour must be provided together")
    if from_hour is not None and to_hour is not None and from_hour >= to_hour:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="from_hour must be before to_hour")

    court = db.get(CourtModel, court_id)
    if not court or not court.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Court not found")

    expire_lapsed_reservations(db, court_id=court_id)

    if from_hour is not None and to_hour is not None:
        operating_windows = [
            (
                datetime.combine(query_date, time(hour=from_hour)),
                datetime.combine(query_date, time(hour=to_hour)),
            )
        ]
    else:
        operating_windows = get_schedule_windows(db, court_id, query_date)

    if not operating_windows:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No schedule defined for this date")

    free_windows = subtract_closures_from_windows(db, court_id, operating_windows)
    if not free_windows:
        return []

    slot_delta = timedelta(minutes=slot_minutes)

    now = datetime.utcnow()
    window_start = free_windows[0][0]
    window_end = free_windows[-1][1]

    reservations = (
        db.query(ReservationModel)
        .filter(
            ReservationModel.court_id == court_id,
            or_(
                ReservationModel.status == ReservationStatus.CONFIRMED.value,
                and_(
                    ReservationModel.status == ReservationStatus.PENDING.value,
                    or_(ReservationModel.expires_at.is_(None), ReservationModel.expires_at > now),
                ),
            ),
            ReservationModel.start_time < window_end,
            ReservationModel.end_time > window_start,
        )
        .order_by(ReservationModel.start_time)
        .all()
    )

    available_slots: List[AvailabilitySlot] = []
    busy_windows: List[Tuple[datetime, datetime]] = [
        (
            max(reservation.start_time, window_start),
            min(reservation.end_time, window_end),
        )
        for reservation in reservations
        if reservation.start_time < window_end and reservation.end_time > window_start
    ]
    busy_windows.sort(key=lambda window: window[0])

    def add_slots(window_start: datetime, window_end: datetime) -> None:
        slot_start = window_start
        while slot_start + slot_delta <= window_end:
            available_slots.append(AvailabilitySlot(start_time=slot_start, end_time=slot_start + slot_delta))
            slot_start += slot_delta

    for window in free_windows:
        cursor = window[0]
        for busy_start, busy_end in busy_windows:
            if busy_end <= window[0] or busy_start >= window[1]:
                continue
            if busy_start > cursor:
                add_slots(cursor, min(busy_start, window[1]))
            cursor = max(cursor, busy_end)
            if cursor >= window[1]:
                break
        if cursor < window[1]:
            add_slots(cursor, window[1])

    return available_slots
