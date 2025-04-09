from pydantic import BaseModel
from typing import Optional

class DBase(BaseModel):
    d: Optional[int] = None

class DCreate(DBase):
    pass

class DUpdate(DBase):
    pass

class DResponse(DBase):
    id: int

    class Config:
        from_attributes = True
