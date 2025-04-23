from pydantic import BaseModel
from typing import Optional

class PBase(BaseModel):
    p: Optional[int] = None
    status: Optional[int] = None
    remarks: Optional[str] = None

class PCreate(PBase):
    pass

class PUpdate(PBase):
    pass

class PResponse(PBase):
    id: int

    class Config:
        from_attributes = True  # For Pydantic v2+
