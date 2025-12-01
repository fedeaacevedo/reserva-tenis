from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import get_settings
from app.models.reservation import Reservation as ReservationModel
from app.models.user import User as UserModel
from app.schemas.reservation import Reservation, ReservationCreate, ReservationStatus
from app.services.notifications import dispatch_notification, queue_notification
from app.services.pricing import calculate_price_for_slot
from app.services.reservations import ensure_court_exists, expire_lapsed_reservations
from app.services.schedules import ensure_slot_not_closed, validate_slot_within_schedule

router = APIRouter(prefix="/reservations", tags=["reservations"])
settings = get_settings()


def get_reservation_owner_or_admin(reservation: ReservationModel, current_user: UserModel) -> None:
    if reservation.user_id and reservation.user_id == current_user.id:
        return
    if current_user.is_admin:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this reservation")


@router.post("/", response_model=Reservation, status_code=status.HTTP_201_CREATED)
def create_reservation(
    reservation_in: ReservationCreate,
    db: Session = Depends(deps.get_db_session),
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> ReservationModel:
    expire_lapsed_reservations(db)
    ensure_court_exists(reservation_in.court_id, db)
    validate_slot_within_schedule(db, reservation_in.court_id, reservation_in.start_time, reservation_in.end_time)
    ensure_slot_not_closed(db, reservation_in.court_id, reservation_in.start_time, reservation_in.end_time)

    user_id = current_user.id
    booking_user = current_user
    if reservation_in.user_id and current_user.is_admin:
        target_user = db.get(UserModel, reservation_in.user_id)
        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found")
        user_id = target_user.id
        booking_user = target_user

    overlapping = (
        db.query(ReservationModel)
        .filter(
            ReservationModel.court_id == reservation_in.court_id,
            ReservationModel.status != ReservationStatus.CANCELLED.value,
            ReservationModel.start_time < reservation_in.end_time,
            ReservationModel.end_time > reservation_in.start_time,
        )
        .first()
    )
    if overlapping:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Time slot already booked")

    hold_minutes = max(settings.RESERVATION_HOLD_MINUTES, 0)
    expires_at = datetime.utcnow() + timedelta(minutes=hold_minutes) if hold_minutes > 0 else None
    price_cents = calculate_price_for_slot(db, reservation_in.court_id, reservation_in.start_time, reservation_in.end_time)

    reservation_data = reservation_in.model_dump()
    reservation_data.pop("user_id", None)
    reservation = ReservationModel(
        **reservation_data,
        user_id=user_id,
        status=ReservationStatus.PENDING.value,
        expires_at=expires_at,
        price_cents=price_cents,
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    notification = queue_notification(
        db,
        event_type="reservation_created",
        reservation=reservation,
        user=booking_user,
        channel="email",
        payload={"reservation_id": reservation.id, "status": reservation.status},
    )
    dispatch_notification(db, notification)
    return reservation


@router.get("/", response_model=List[Reservation])
def list_reservations(
    court_id: Optional[int] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(deps.get_db_session),
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> List[ReservationModel]:
    expire_lapsed_reservations(db)
    query = db.query(ReservationModel)

    if court_id is not None:
        query = query.filter(ReservationModel.court_id == court_id)
    if date_from is not None:
        query = query.filter(ReservationModel.start_time >= date_from)
    if date_to is not None:
        query = query.filter(ReservationModel.end_time <= date_to)

    if not current_user.is_admin:
        query = query.filter(ReservationModel.user_id == current_user.id)

    return query.order_by(ReservationModel.start_time).all()


@router.get("/{reservation_id}", response_model=Reservation)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(deps.get_db_session),
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> ReservationModel:
    expire_lapsed_reservations(db)
    reservation = db.get(ReservationModel, reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    if not current_user.is_admin:
        get_reservation_owner_or_admin(reservation, current_user)
    return reservation


@router.post("/{reservation_id}/confirm", response_model=Reservation)
def confirm_reservation(
    reservation_id: int,
    db: Session = Depends(deps.get_db_session),
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> ReservationModel:
    expire_lapsed_reservations(db)
    reservation = db.get(ReservationModel, reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    get_reservation_owner_or_admin(reservation, current_user)
    if reservation.status == ReservationStatus.CANCELLED.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reservation is cancelled")
    if reservation.status == ReservationStatus.CONFIRMED.value:
        return reservation

    reservation.status = ReservationStatus.CONFIRMED.value
    reservation.expires_at = None
    db.commit()
    db.refresh(reservation)

    notification = queue_notification(
        db,
        event_type="reservation_confirmed",
        reservation=reservation,
        user=reservation.user,
        channel="email",
        payload={"reservation_id": reservation.id},
    )
    dispatch_notification(db, notification)
    return reservation


@router.delete("/{reservation_id}", response_model=Reservation)
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(deps.get_db_session),
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> ReservationModel:
    expire_lapsed_reservations(db)
    reservation = db.get(ReservationModel, reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    get_reservation_owner_or_admin(reservation, current_user)
    reservation.status = ReservationStatus.CANCELLED.value
    reservation.expires_at = None
    db.commit()
    db.refresh(reservation)

    notification = queue_notification(
        db,
        event_type="reservation_cancelled",
        reservation=reservation,
        user=reservation.user,
        channel="email",
        payload={"reservation_id": reservation.id},
    )
    dispatch_notification(db, notification)
    return reservation
