from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Court(Base):
    __tablename__ = "courts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    surface = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    reservations = relationship(
        "Reservation",
        back_populates="court",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    closures = relationship(
        "CourtClosure",
        back_populates="court",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    schedules = relationship(
        "CourtSchedule",
        back_populates="court",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    tariffs = relationship(
        "CourtTariff",
        back_populates="court",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
