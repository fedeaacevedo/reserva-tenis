from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("courts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False, index=True)
    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(50), nullable=True)
    status = Column(String(20), default="pending", nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    price_cents = Column(Integer, nullable=True)

    court = relationship("Court", back_populates="reservations")
    user = relationship("User", back_populates="reservations")
    notifications = relationship(
        "Notification",
        back_populates="reservation",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (
        UniqueConstraint("court_id", "start_time", "end_time", name="uq_court_timeslot"),
        CheckConstraint("end_time > start_time", name="ck_reservation_time_order"),
    )
