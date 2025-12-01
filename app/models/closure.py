from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class CourtClosure(Base):
    __tablename__ = "court_closures"

    id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("courts.id", ondelete="SET NULL"), nullable=True, index=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False, index=True)
    reason = Column(String(200), nullable=True)

    court = relationship("Court", back_populates="closures")

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="ck_closure_time_order"),
    )
