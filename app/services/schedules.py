from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.closure import CourtClosure as CourtClosureModel
from app.models.schedule import CourtSchedule as CourtScheduleModel


ScheduleWindow = Tuple[datetime, datetime]


def _combine_date_time(target_date: date, slot_time: time) -> datetime:
    return datetime.combine(target_date, slot_time)


def get_schedule_windows(
    db: Session,
    court_id: int,
    target_date: date,
) -> List[ScheduleWindow]:
    day_of_week = target_date.weekday()
    schedules = (
        db.query(CourtScheduleModel)
        .filter(
            CourtScheduleModel.is_active.is_(True),
            CourtScheduleModel.day_of_week == day_of_week,
            or_(CourtScheduleModel.court_id == court_id, CourtScheduleModel.court_id.is_(None)),
        )
        .order_by(
            CourtScheduleModel.court_id.desc().nullslast(),
            CourtScheduleModel.open_time,
        )
        .all()
    )

    windows: List[ScheduleWindow] = []
    for schedule in schedules:
        windows.append(
            (
                _combine_date_time(target_date, schedule.open_time),
                _combine_date_time(target_date, schedule.close_time),
            )
        )
    return windows


def validate_slot_within_schedule(
    db: Session,
    court_id: int,
    start_time: datetime,
    end_time: datetime,
) -> None:
    windows = get_schedule_windows(db, court_id, start_time.date())
    if not windows:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No schedule defined for this date")

    for window_start, window_end in windows:
        if start_time >= window_start and end_time <= window_end:
            return
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slot outside operating hours")


def ensure_slot_not_closed(
    db: Session,
    court_id: int,
    start_time: datetime,
    end_time: datetime,
) -> None:
    conflict = (
        db.query(CourtClosureModel)
        .filter(
            or_(CourtClosureModel.court_id.is_(None), CourtClosureModel.court_id == court_id),
            CourtClosureModel.start_time < end_time,
            CourtClosureModel.end_time > start_time,
        )
        .first()
    )
    if conflict:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Court closed for maintenance")


def subtract_closures_from_windows(
    db: Session,
    court_id: int,
    windows: List[ScheduleWindow],
) -> List[ScheduleWindow]:
    if not windows:
        return []

    day_start = windows[0][0].date()
    date_start = datetime.combine(day_start, time.min)
    date_end = date_start + timedelta(days=1)

    closures = (
        db.query(CourtClosureModel)
        .filter(
            CourtClosureModel.start_time < date_end,
            CourtClosureModel.end_time > date_start,
            or_(CourtClosureModel.court_id.is_(None), CourtClosureModel.court_id == court_id),
        )
        .all()
    )

    if not closures:
        return windows

    result: List[ScheduleWindow] = []
    for window_start, window_end in windows:
        cursor = window_start
        for closure in closures:
            overlap_start = max(cursor, closure.start_time)
            overlap_end = min(window_end, closure.end_time)
            if overlap_start < overlap_end:
                if cursor < overlap_start:
                    result.append((cursor, overlap_start))
                cursor = overlap_end
        if cursor < window_end:
            result.append((cursor, window_end))

    return result


def calculate_total_slots(
    windows: List[ScheduleWindow],
    slot_minutes: int,
) -> int:
    total_minutes = 0
    for start_time, end_time in windows:
        total_minutes += int((end_time - start_time).total_seconds() // 60)
    return total_minutes // slot_minutes if slot_minutes > 0 else 0
