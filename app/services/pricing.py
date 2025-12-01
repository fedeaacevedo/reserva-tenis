from datetime import datetime
from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.schedule import CourtTariff as CourtTariffModel


def calculate_price_for_slot(
    db: Session,
    court_id: int,
    start_time: datetime,
    end_time: datetime,
) -> Optional[int]:
    day_of_week = start_time.weekday()
    slot_start = start_time.time()
    slot_end = end_time.time()

    tariffs = (
        db.query(CourtTariffModel)
        .filter(
            CourtTariffModel.is_active.is_(True),
            or_(CourtTariffModel.court_id == court_id, CourtTariffModel.court_id.is_(None)),
            or_(CourtTariffModel.day_of_week == day_of_week, CourtTariffModel.day_of_week.is_(None)),
            CourtTariffModel.start_time <= slot_start,
            CourtTariffModel.end_time >= slot_end,
        )
        .order_by(
            CourtTariffModel.court_id.desc().nullslast(),
            CourtTariffModel.day_of_week.desc().nullslast(),
            CourtTariffModel.start_time.desc(),
        )
        .first()
    )

    if not tariffs:
        return None

    duration_minutes = int((end_time - start_time).total_seconds() // 60)
    price = int(tariffs.price_per_hour_cents * duration_minutes / 60)
    return price
