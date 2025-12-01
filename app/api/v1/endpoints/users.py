from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User as UserModel
from app.schemas.user import AdminUserCreate, User, UserCreate, UserUpdate
from app.services.users import create_user, get_user_by_email, update_user_password

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(deps.get_db_session)) -> UserModel:
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = create_user(
        db,
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name,
        phone=user_in.phone,
    )
    return user


@router.post("/admin", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user_admin(
    user_in: AdminUserCreate,
    db: Session = Depends(deps.get_db_session),
    _: UserModel = Depends(deps.get_current_admin),
) -> UserModel:
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = create_user(
        db,
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name,
        phone=user_in.phone,
        is_admin=user_in.is_admin,
        is_active=user_in.is_active,
    )
    return user


@router.get("/me", response_model=User)
def read_current_user(current_user: UserModel = Depends(deps.get_current_active_user)) -> UserModel:
    return current_user


@router.get("/", response_model=List[User])
def list_users(
    db: Session = Depends(deps.get_db_session),
    _: UserModel = Depends(deps.get_current_admin),
) -> List[UserModel]:
    return db.query(UserModel).order_by(UserModel.created_at.desc()).all()


@router.get("/{user_id}", response_model=User)
def get_user(
    user_id: int,
    db: Session = Depends(deps.get_db_session),
    _: UserModel = Depends(deps.get_current_admin),
) -> UserModel:
    user = db.get(UserModel, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(deps.get_db_session),
    _: UserModel = Depends(deps.get_current_admin),
) -> UserModel:
    user = db.get(UserModel, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_data = user_in.model_dump(exclude_unset=True)
    new_password = update_data.pop("password", None)
    new_email = update_data.get("email")
    if new_email and new_email != user.email:
        if get_user_by_email(db, new_email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        user.email = new_email
        update_data.pop("email", None)

    for field, value in update_data.items():
        setattr(user, field, value)

    if new_password:
        user = update_user_password(db, user, new_password)
    else:
        db.commit()
        db.refresh(user)

    return user
