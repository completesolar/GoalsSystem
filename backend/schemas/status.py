from pydantic import BaseModel
from typing import Optional

# Base schema shared by create & update
class StatusBase(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None
    remarks: Optional[str] = None
    active_status: Optional[int] = None


# Create schema
class StatusCreate(StatusBase):
    pass

# Update schema
class StatusUpdate(StatusBase):
    pass

# Schema used when returning data (e.g. from the DB)
class StatusResponse(StatusBase):
    id: int

    class Config:
        from_attributes = True  # for Pydantic v2+
