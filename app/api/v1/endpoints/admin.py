from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.closure import CourtClosure as CourtClosureModel
from app.schemas.closure import Closure, ClosureCreate, ClosureUpdate
from app.services.reservations import ensure_court_exists

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/closures/", response_model=Closure, status_code=status.HTTP_201_CREATED)
def create_closure(
    closure_in: ClosureCreate,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> CourtClosureModel:
    if closure_in.court_id:
        ensure_court_exists(closure_in.court_id, db)

    closure = CourtClosureModel(**closure_in.model_dump())
    db.add(closure)
    db.commit()
    db.refresh(closure)
    return closure


@router.get("/closures/", response_model=List[Closure])
def list_closures(
    court_id: Optional[int] = Query(default=None),
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> List[CourtClosureModel]:
    query = db.query(CourtClosureModel)
    if court_id is not None:
        query = query.filter(CourtClosureModel.court_id == court_id)
    return query.order_by(CourtClosureModel.start_time).all()


@router.get("/closures/{closure_id}", response_model=Closure)
def get_closure(
    closure_id: int,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> CourtClosureModel:
    closure = db.get(CourtClosureModel, closure_id)
    if not closure:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Closure not found")
    return closure


@router.put("/closures/{closure_id}", response_model=Closure)
def update_closure(
    closure_id: int,
    closure_in: ClosureUpdate,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> CourtClosureModel:
    closure = db.get(CourtClosureModel, closure_id)
    if not closure:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Closure not found")

    update_data = closure_in.model_dump(exclude_unset=True)
    new_court_id = update_data.get("court_id")
    if new_court_id:
        ensure_court_exists(new_court_id, db)

    if "start_time" in update_data and "end_time" not in update_data:
        if closure.end_time and closure.end_time <= update_data["start_time"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid time window")
    if "end_time" in update_data and "start_time" not in update_data:
        if closure.start_time and update_data["end_time"] <= closure.start_time:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid time window")

    for field, value in update_data.items():
        setattr(closure, field, value)

    db.commit()
    db.refresh(closure)
    return closure


@router.delete("/closures/{closure_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_closure(
    closure_id: int,
    db: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_admin),
) -> None:
    closure = db.get(CourtClosureModel, closure_id)
    if not closure:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Closure not found")

    db.delete(closure)
    db.commit()
