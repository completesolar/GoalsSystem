from pydantic import BaseModel
from typing import Optional

# Base schema shared by create & update
class PBase(BaseModel):
    p: Optional[int] = None

# Create schema
class PCreate(PBase):
    pass

# Update schema
class PUpdate(PBase):
    pass

# Schema used when returning data (e.g. from the DB)
class PResponse(PBase):
    id: int

    class Config:
        from_attributes = True  # for Pydantic v2+
