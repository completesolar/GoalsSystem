from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date

class WhoBase(BaseModel):
    employee_full_name: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    initials: Optional[str] = None
    email: Optional[EmailStr] = None
    employee_status: Optional[str] = None
    supervisor_id: Optional[int] = None
    termination_date: Optional[date] = None
    team_name: Optional[str] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True


class WhoCreate(WhoBase):
    pass


class WhoUpdate(WhoBase):
    pass


class WhoResponse(WhoBase):
    id: int  # assuming each record has a unique ID
    
class SupervisorChainResponse(BaseModel):
    initials: str
    employee_full_name: str
    supervisor_names: List[str]

class WhoResponse(WhoBase):
    id: int

    class Config:
        from_attributes = True

class GlobalSettingRequest(BaseModel):
    value: bool
    updated_by: str
