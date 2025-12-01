from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NotificationBase(BaseModel):
    reservation_id: Optional[int] = None
    user_id: Optional[int] = None
    channel: str = "email"
    event_type: str
    recipient: str
    payload: Optional[str] = None


class NotificationCreate(NotificationBase):
    pass


class Notification(NotificationBase):
    id: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    sent_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
