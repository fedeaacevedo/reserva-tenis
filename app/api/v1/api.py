from fastapi import APIRouter

from app.api.v1.endpoints.admin import router as admin_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.calendars import router as calendars_router
from app.api.v1.endpoints.courts import router as courts_router
from app.api.v1.endpoints.notifications import router as notifications_router
from app.api.v1.endpoints.reports import router as reports_router
from app.api.v1.endpoints.reservations import router as reservations_router
from app.api.v1.endpoints.schedules import router as schedules_router
from app.api.v1.endpoints.users import router as users_router

api_router = APIRouter()
api_router.include_router(courts_router)
api_router.include_router(reservations_router)
api_router.include_router(admin_router)
api_router.include_router(users_router)
api_router.include_router(auth_router)
api_router.include_router(schedules_router)
api_router.include_router(notifications_router)
api_router.include_router(reports_router)
api_router.include_router(calendars_router)
