from pydantic import BaseModel, EmailStr
from typing import List, Optional

class WhoBase(BaseModel):
    id: int
    slno: Optional[int]
    ee_id: Optional[int]
    last_name: str
    first_name: str
    middle_name: Optional[str] = None
    decoder: Optional[str] = None
    mobile: Optional[str] = None
    work_email: Optional[EmailStr] = None
    title: Optional[str] = None

    class Config:
        from_attributes = True

class WhoCreate(WhoBase):
    pass  # Inherits all fields from WhoBase

class WhoUpdate(BaseModel):
    id: Optional[int] = None
    slno: Optional[int] = None
    ee_id: Optional[int] = None
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    decoder: Optional[str] = None
    mobile: Optional[str] = None
    work_email: Optional[EmailStr] = None
    title: Optional[str] = None

class WhoResponse(WhoBase):
     id: int  # ID is included in the response model
     class Config:
          from_attributes  = True