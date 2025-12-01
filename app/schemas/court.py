from typing import Optional

from pydantic import BaseModel, ConfigDict

class CourtBase(BaseModel):
    name: str
    surface: Optional[str] = None
    is_active: bool = True


class CourtCreate(CourtBase):
    pass


class CourtUpdate(BaseModel):
    name: Optional[str] = None
    surface: Optional[str] = None
    is_active: Optional[bool] = None


class Court(CourtBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
