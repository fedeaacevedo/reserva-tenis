from __future__ import annotations

from datetime import time
from typing import Iterable, List, Tuple

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.court import Court as CourtModel
from app.models.schedule import CourtSchedule as CourtScheduleModel
from app.services.users import create_user, get_user_by_email

DEFAULT_COURTS = [
    {"name": "Cancha 1", "surface": "Polvo de ladrillo"},
    {"name": "Cancha 2", "surface": "Polvo de ladrillo"},
    {"name": "Cancha 3", "surface": "Cemento"},
    {"name": "Cancha 4", "surface": "Cemento"},
]
DEFAULT_OPEN_TIME = time(hour=8)
DEFAULT_CLOSE_TIME = time(hour=23)

DEFAULT_ADMIN_EMAIL = "admin@reservatenis.com"
DEFAULT_ADMIN_PASSWORD = "admin123"


def ensure_admin(db: Session) -> bool:
    """Create a default admin user if missing. Returns True if newly created."""
    if get_user_by_email(db, DEFAULT_ADMIN_EMAIL):
        return False
    create_user(
        db,
        email=DEFAULT_ADMIN_EMAIL,
        password=DEFAULT_ADMIN_PASSWORD,
        full_name="Administrador ReservaTenis",
        phone="+54 11 0000-0000",
        is_admin=True,
    )
    return True


def ensure_courts(db: Session) -> Tuple[List[CourtModel], int]:
    created = 0
    for court_data in DEFAULT_COURTS:
        if (
            db.query(CourtModel)
            .filter(CourtModel.name == court_data["name"])
            .first()
        ):
            continue
        db.add(CourtModel(**court_data))
        created += 1
    if created:
        db.commit()
    courts = (
        db.query(CourtModel)
        .filter(CourtModel.name.in_([court["name"] for court in DEFAULT_COURTS]))
        .order_by(CourtModel.id)
        .all()
    )
    return courts, created


def ensure_schedules(db: Session, courts: Iterable[CourtModel]) -> int:
    created = 0
    for court in courts:
        for day in range(7):
            if (
                db.query(CourtScheduleModel)
                .filter(
                    CourtScheduleModel.court_id == court.id,
                    CourtScheduleModel.day_of_week == day,
                )
                .first()
            ):
                continue
            schedule = CourtScheduleModel(
                court_id=court.id,
                day_of_week=day,
                open_time=DEFAULT_OPEN_TIME,
                close_time=DEFAULT_CLOSE_TIME,
                is_active=True,
            )
            db.add(schedule)
            created += 1
    if created:
        db.commit()
    return created


def main() -> None:
    db = SessionLocal()
    try:
        admin_created = ensure_admin(db)
        courts, courts_created = ensure_courts(db)
        schedules_created = ensure_schedules(db, courts)
    finally:
        db.close()

    print("Bootstrap completado.")
    if admin_created:
        print(f"- Usuario admin creado: {DEFAULT_ADMIN_EMAIL} / {DEFAULT_ADMIN_PASSWORD}")
    else:
        print(f"- Usuario admin existente: {DEFAULT_ADMIN_EMAIL}")
    print(f"- Canchas disponibles: {len(courts)} (nuevas: {courts_created})")
    print(f"- Horarios creados: {schedules_created}")


if __name__ == "__main__":
    main()

