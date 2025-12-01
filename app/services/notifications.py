import json
import logging
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.notification import Notification as NotificationModel
from app.models.reservation import Reservation as ReservationModel
from app.models.user import User as UserModel

logger = logging.getLogger(__name__)


def queue_notification(
    db: Session,
    *,
    event_type: str,
    reservation: Optional[ReservationModel] = None,
    user: Optional[UserModel] = None,
    channel: str = "email",
    recipient: Optional[str] = None,
    payload: Optional[dict] = None,
) -> NotificationModel:
    recipient_address = recipient or (user.email if user else (reservation.customer_phone or ""))
    notification = NotificationModel(
        reservation_id=reservation.id if reservation else None,
        user_id=user.id if user else None,
        channel=channel,
        event_type=event_type,
        recipient=recipient_address,
        payload=json.dumps(payload) if payload else None,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def mark_notification_sent(db: Session, notification: NotificationModel, *, error: Optional[str] = None) -> NotificationModel:
    if error:
        notification.status = "failed"
        notification.error_message = error
    else:
        notification.status = "sent"
        notification.sent_at = datetime.utcnow()
    db.commit()
    db.refresh(notification)
    return notification


def dispatch_notification(
    db: Session,
    notification: NotificationModel,
) -> NotificationModel:
    try:
        logger.info(
            "Sending notification %s via %s to %s (event=%s)",
            notification.id,
            notification.channel,
            notification.recipient,
            notification.event_type,
        )
        return mark_notification_sent(db, notification)
    except Exception as exc:  # pragma: no cover - logging only
        logger.error("Failed to send notification %s: %s", notification.id, exc)
        return mark_notification_sent(db, notification, error=str(exc))
