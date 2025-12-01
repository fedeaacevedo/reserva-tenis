from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.api import deps
from app.models.court import Court as CourtModel
from app.models.reservation import Reservation as ReservationModel
from app.schemas.reservation import ReservationStatus
from app.services.calendar import reservations_to_ics_feed

router = APIRouter(prefix="/calendars", tags=["calendars"])


@router.get("/courts/{court_id}.ics")
def court_calendar(
    court_id: int,
    days: int = Query(30, ge=1, le=180),
    db: Session = Depends(deps.get_db_session),
) -> Response:
    court = db.get(CourtModel, court_id)
    if not court or not court.is_active:
        raise HTTPException(status_code=404, detail="Court not found")

    start_time = datetime.utcnow()
    end_time = start_time + timedelta(days=days)
    reservations = (
        db.query(ReservationModel)
        .filter(
            ReservationModel.court_id == court_id,
            ReservationModel.status == ReservationStatus.CONFIRMED.value,
            ReservationModel.start_time >= start_time,
            ReservationModel.start_time <= end_time,
        )
        .order_by(ReservationModel.start_time)
        .all()
    )
    ics_content = reservations_to_ics_feed(reservations, f"Court {court.name}")
    return Response(content=ics_content, media_type="text/calendar")


@router.get("/me.ics")
def user_calendar(
    days: int = Query(30, ge=1, le=180),
    db: Session = Depends(deps.get_db_session),
    current_user=Depends(deps.get_current_active_user),
) -> Response:
    start_time = datetime.utcnow()
    end_time = start_time + timedelta(days=days)
    reservations = (
        db.query(ReservationModel)
        .filter(
            ReservationModel.user_id == current_user.id,
            ReservationModel.status == ReservationStatus.CONFIRMED.value,
            ReservationModel.start_time >= start_time,
            ReservationModel.start_time <= end_time,
        )
        .order_by(ReservationModel.start_time)
        .all()
    )
    ics_content = reservations_to_ics_feed(reservations, f"Reservas {current_user.full_name or current_user.email}")
    return Response(content=ics_content, media_type="text/calendar")
