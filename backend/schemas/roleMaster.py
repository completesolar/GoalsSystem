from pydantic import BaseModel
from typing import Optional

class RoleMasterBase(BaseModel):
    role: Optional[str] = None
    user: Optional[str] = None
    user_id: Optional[int] = None
    role_id: Optional[int] = None
    remarks: Optional[str] = None

class RoleMasterCreate(RoleMasterBase):
    pass

class RoleMasterUpdate(RoleMasterBase):
    pass

class RoleMasterResponse(RoleMasterBase):
    id: int

    class Config:
        from_attributes = True