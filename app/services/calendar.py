from datetime import datetime
from typing import Iterable

from app.models.reservation import Reservation as ReservationModel


def format_datetime(dt: datetime) -> str:
    return dt.strftime("%Y%m%dT%H%M%SZ")


def reservation_to_ics_event(reservation: ReservationModel) -> str:
    summary = f"Court #{reservation.court_id} - {reservation.customer_name}"
    description = f"Status: {reservation.status}"
    uid = f"reservation-{reservation.id}@reservatenis"
    return (
        "BEGIN:VEVENT\n"
        f"UID:{uid}\n"
        f"DTSTAMP:{format_datetime(reservation.created_at)}\n"
        f"DTSTART:{format_datetime(reservation.start_time)}\n"
        f"DTEND:{format_datetime(reservation.end_time)}\n"
        f"SUMMARY:{summary}\n"
        f"DESCRIPTION:{description}\n"
        "END:VEVENT\n"
    )


def reservations_to_ics_feed(reservations: Iterable[ReservationModel], calendar_name: str) -> str:
    events = "".join(reservation_to_ics_event(reservation) for reservation in reservations)
    return (
        "BEGIN:VCALENDAR\n"
        "VERSION:2.0\n"
        f"PRODID:-//ReservaTenis//EN\n"
        f"X-WR-CALNAME:{calendar_name}\n"
        f"{events}"
        "END:VCALENDAR\n"
    )
