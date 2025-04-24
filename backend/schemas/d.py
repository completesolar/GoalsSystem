from pydantic import BaseModel
from typing import Optional

class DBase(BaseModel):
    d: Optional[int] = None
    status: Optional[int] = None
    remarks: Optional[str] = None

class DCreate(DBase):
    pass

class DUpdate(DBase):
    pass

class DResponse(DBase):
    id: int

    class Config:
        from_attributes = True
