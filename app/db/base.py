from app.db.base_class import Base

# Import models so Alembic/FastAPI can discover metadata for migrations and table creation.
from app.models.user import User  # noqa: E402,F401
from app.models.court import Court  # noqa: E402,F401
from app.models.reservation import Reservation  # noqa: E402,F401
from app.models.closure import CourtClosure  # noqa: E402,F401
from app.models.notification import Notification  # noqa: E402,F401
from app.models.schedule import CourtSchedule, CourtTariff  # noqa: E402,F401
