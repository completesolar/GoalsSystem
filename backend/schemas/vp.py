from pydantic import BaseModel
from typing import Optional


# Base schema shared by create & update
class VPBase(BaseModel):
    id: int
    last_name: str
    first_name: str
    middle_name: str
    decoder: Optional[str] = None
    work_email: str
    title: str


# Create schema
class VPCreate(VPBase):
    pass


# Update schema
class VPUpdate(BaseModel):
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    decoder: Optional[str] = None
    work_email: Optional[str] = None
    title: Optional[str] = None


# Schema used when returning data (e.g. from the DB)
class VPResponse(BaseModel):
    id: int
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    decoder: Optional[str] = None
    work_email: Optional[str] = None
    title: Optional[str] = None

    class Config:
        from_attributes = True  # for Pydantic v2+