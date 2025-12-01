from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User as UserModel


def get_user_by_email(db: Session, email: str) -> Optional[UserModel]:
    return db.query(UserModel).filter(UserModel.email == email).first()


def create_user(
    db: Session,
    *,
    email: str,
    password: str,
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    is_admin: bool = False,
    is_active: bool = True,
) -> UserModel:
    user = UserModel(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        phone=phone,
        is_admin=is_admin,
        is_active=is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[UserModel]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def update_user_password(db: Session, user: UserModel, new_password: str) -> UserModel:
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return user
