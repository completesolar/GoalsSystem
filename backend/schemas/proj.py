from pydantic import BaseModel
from typing import Optional

# Base schema shared by create & update
class ProjBase(BaseModel):
    proj: Optional[str] = None
    status: Optional[int] = None
    remarks: Optional[str] = None

# Create schema
class ProjCreate(ProjBase):
    pass

# Update schema
class ProjUpdate(ProjBase):
    pass

# Schema used when returning data (e.g. from the DB)
class ProjResponse(ProjBase):
    id: int

    class Config:
        from_attributes = True  # for Pydantic v2+
