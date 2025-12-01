from sqlalchemy import Boolean, CheckConstraint, Column, ForeignKey, Integer, Time
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class CourtSchedule(Base):
    __tablename__ = "court_schedules"

    id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("courts.id", ondelete="CASCADE"), nullable=True, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0 = Monday
    open_time = Column(Time, nullable=False)
    close_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    court = relationship("Court", back_populates="schedules")

    __table_args__ = (
        CheckConstraint("close_time > open_time", name="ck_schedule_time_order"),
    )


class CourtTariff(Base):
    __tablename__ = "court_tariffs"

    id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("courts.id", ondelete="CASCADE"), nullable=True, index=True)
    day_of_week = Column(Integer, nullable=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    price_per_hour_cents = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    court = relationship("Court", back_populates="tariffs")

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="ck_tariff_time_order"),
    )
