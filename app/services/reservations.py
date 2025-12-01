from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.court import Court as CourtModel
from app.models.reservation import Reservation as ReservationModel
from app.schemas.reservation import ReservationStatus


def ensure_court_exists(court_id: int, db: Session) -> CourtModel:
    court = db.get(CourtModel, court_id)
    if not court or not court.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Court not found")
    return court


def expire_lapsed_reservations(db: Session, *, court_id: Optional[int] = None) -> None:
    now = datetime.utcnow()
    query = (
        db.query(ReservationModel)
        .filter(
            ReservationModel.status == ReservationStatus.PENDING.value,
            ReservationModel.expires_at.isnot(None),
            ReservationModel.expires_at <= now,
        )
    )
    if court_id is not None:
        query = query.filter(ReservationModel.court_id == court_id)

    expired = query.all()
    if not expired:
        return

    for reservation in expired:
        reservation.status = ReservationStatus.CANCELLED.value
        reservation.expires_at = None

    db.commit()
