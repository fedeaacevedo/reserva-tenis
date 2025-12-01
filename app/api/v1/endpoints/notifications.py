from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.notification import Notification as NotificationModel
from app.schemas.notification import Notification
from app.services.notifications import dispatch_notification

router = APIRouter(prefix="/admin/notifications", tags=["admin-notifications"])


@router.get("/", response_model=List[Notification])
def list_notifications(
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> List[NotificationModel]:
    return db.query(NotificationModel).order_by(NotificationModel.created_at.desc()).all()


@router.post("/{notification_id}/send", response_model=Notification)
def send_notification(
    notification_id: int,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> NotificationModel:
    notification = db.get(NotificationModel, notification_id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notification.status = "pending"
    notification.error_message = None
    notification.sent_at = None
    db.commit()
    db.refresh(notification)
    return dispatch_notification(db, notification)
