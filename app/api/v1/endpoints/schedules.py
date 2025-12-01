from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.schedule import CourtSchedule as CourtScheduleModel, CourtTariff as CourtTariffModel
from app.schemas.schedule import (
    Schedule,
    ScheduleCreate,
    ScheduleUpdate,
    Tariff,
    TariffCreate,
    TariffUpdate,
)
from app.services.reservations import ensure_court_exists

router = APIRouter(prefix="/admin", tags=["admin-schedule"])


@router.post("/schedules/", response_model=Schedule, status_code=status.HTTP_201_CREATED)
def create_schedule(
    schedule_in: ScheduleCreate,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> CourtScheduleModel:
    if schedule_in.court_id:
        ensure_court_exists(schedule_in.court_id, db)
    schedule = CourtScheduleModel(**schedule_in.model_dump())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get("/schedules/", response_model=List[Schedule])
def list_schedules(
    court_id: Optional[int] = Query(default=None),
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> List[CourtScheduleModel]:
    query = db.query(CourtScheduleModel)
    if court_id is not None:
        query = query.filter(CourtScheduleModel.court_id == court_id)
    return query.order_by(CourtScheduleModel.day_of_week, CourtScheduleModel.open_time).all()


@router.put("/schedules/{schedule_id}", response_model=Schedule)
def update_schedule(
    schedule_id: int,
    schedule_in: ScheduleUpdate,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> CourtScheduleModel:
    schedule = db.get(CourtScheduleModel, schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    update_data = schedule_in.model_dump(exclude_unset=True)
    if "court_id" in update_data and update_data["court_id"]:
        ensure_court_exists(update_data["court_id"], db)
    for field, value in update_data.items():
        setattr(schedule, field, value)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> None:
    schedule = db.get(CourtScheduleModel, schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    db.delete(schedule)
    db.commit()


@router.post("/tariffs/", response_model=Tariff, status_code=status.HTTP_201_CREATED)
def create_tariff(
    tariff_in: TariffCreate,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> CourtTariffModel:
    if tariff_in.court_id:
        ensure_court_exists(tariff_in.court_id, db)
    tariff = CourtTariffModel(**tariff_in.model_dump())
    db.add(tariff)
    db.commit()
    db.refresh(tariff)
    return tariff


@router.get("/tariffs/", response_model=List[Tariff])
def list_tariffs(
    court_id: Optional[int] = Query(default=None),
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> List[CourtTariffModel]:
    query = db.query(CourtTariffModel)
    if court_id is not None:
        query = query.filter(CourtTariffModel.court_id == court_id)
    return query.order_by(CourtTariffModel.day_of_week, CourtTariffModel.start_time).all()


@router.put("/tariffs/{tariff_id}", response_model=Tariff)
def update_tariff(
    tariff_id: int,
    tariff_in: TariffUpdate,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> CourtTariffModel:
    tariff = db.get(CourtTariffModel, tariff_id)
    if not tariff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tariff not found")
    update_data = tariff_in.model_dump(exclude_unset=True)
    if "court_id" in update_data and update_data["court_id"]:
        ensure_court_exists(update_data["court_id"], db)
    for field, value in update_data.items():
        setattr(tariff, field, value)
    db.commit()
    db.refresh(tariff)
    return tariff


@router.delete("/tariffs/{tariff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tariff(
    tariff_id: int,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> None:
    tariff = db.get(CourtTariffModel, tariff_id)
    if not tariff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tariff not found")
    db.delete(tariff)
    db.commit()
