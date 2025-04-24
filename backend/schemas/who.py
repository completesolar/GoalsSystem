from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date


class WhoBase(BaseModel):
    id: int
    employee_id: Optional[int]
    employee_name: Optional[str]
    last_name: Optional[str] = None 
    first_name: Optional[str] = None 
    initials: Optional[str] = None
    primary_email: Optional[EmailStr] = None
    employee_status: Optional[str] = None
    client_hire_date: Optional[date] = None
    employee_reference_id: Optional[int] = None
    job_title: Optional[str] = None
    employee_level: Optional[int] = None
    supervisor_name: Optional[str] = None
    is_manager: Optional[bool] = None
    manager_level: Optional[int] = None
    worksite_state: Optional[str] = None
    division: Optional[str] = None
    manager_level_1: Optional[str] = None
    manager_level_2: Optional[str] = None
    manager_level_3: Optional[str] = None
    manager_level_4: Optional[str] = None

    class Config:
        from_attributes = True


class WhoCreate(BaseModel):
    employee_id: Optional[int]
    employee_name: Optional[str]
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    initials: Optional[str] = None
    primary_email: Optional[EmailStr] = None
    employee_status: Optional[str] = None
    client_hire_date: Optional[date] = None
    employee_reference_id: Optional[int] = None
    job_title: Optional[str] = None
    employee_level: Optional[int] = None
    supervisor_name: Optional[str] = None
    is_manager: Optional[bool] = None
    manager_level: Optional[int] = None
    worksite_state: Optional[str] = None
    division: Optional[str] = None
    manager_level_1: Optional[str] = None
    manager_level_2: Optional[str] = None
    manager_level_3: Optional[str] = None
    manager_level_4: Optional[str] = None


class WhoUpdate(BaseModel):
    id: Optional[int]
    employee_id: Optional[int]
    employee_name: Optional[str]
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    initials: Optional[str] = None
    primary_email: Optional[EmailStr] = None
    employee_status: Optional[str] = None
    client_hire_date: Optional[date] = None
    employee_reference_id: Optional[int] = None
    job_title: Optional[str] = None
    employee_level: Optional[int] = None
    supervisor_name: Optional[str] = None
    is_manager: Optional[bool] = None
    manager_level: Optional[int] = None
    worksite_state: Optional[str] = None
    division: Optional[str] = None
    manager_level_1: Optional[str] = None
    manager_level_2: Optional[str] = None
    manager_level_3: Optional[str] = None
    manager_level_4: Optional[str] = None


class WhoResponse(WhoBase):
    id: int

    class Config:
        from_attributes = True
