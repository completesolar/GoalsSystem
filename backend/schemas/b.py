from pydantic import BaseModel
from typing import Optional

class BBase(BaseModel):
    b: Optional[int] = None
    status: Optional[int] = None
    remarks: Optional[str] = None

class BCreate(BBase):
    pass

class BUpdate(BBase):
    pass

class BResponse(BBase):
    id: int

    class Config:
        from_attributes = True
