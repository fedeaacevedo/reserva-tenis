from fastapi import FastAPI

from app.api.v1.api import api_router
from app.core.config import get_settings
from app.db import base  # noqa: F401
from app.db.base_class import Base
from app.db.session import engine

settings = get_settings()

app = FastAPI(title=settings.PROJECT_NAME)

# Crear tablas solamente en desarrollo. En producción usar Alembic.
if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
    Base.metadata.create_all(bind=engine)

app.include_router(api_router, prefix=settings.API_V1_STR)
