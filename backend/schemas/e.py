from pydantic import BaseModel
from typing import Optional

class EBase(BaseModel):
    e: Optional[int] = None
    status: Optional[int] = None
    remarks: Optional[str] = None

class ECreate(EBase):
    pass

class EUpdate(EBase):
    pass

class EResponse(EBase):
    id: int

    class Config:
        from_attributes = True
