from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    channel = Column(String(50), nullable=False, default="email")
    event_type = Column(String(100), nullable=False)
    recipient = Column(String(255), nullable=False)
    payload = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    error_message = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    sent_at = Column(DateTime, nullable=True)

    reservation = relationship("Reservation", back_populates="notifications")
    user = relationship("User", back_populates="notifications")
