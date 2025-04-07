from pydantic import BaseModel
from typing import Optional

# Base schema shared by create & update
class VPBase(BaseModel):
    vp: Optional[str] = None

# Create schema
class VPCreate(VPBase):
    pass

# Update schema
class VPUpdate(VPBase):
    pass

# Schema used when returning data (e.g. from the DB)
class VPResponse(VPBase):
    id: int

    class Config:
        from_attributes = True  # for Pydantic v2+
