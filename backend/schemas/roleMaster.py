from pydantic import BaseModel
from typing import List, Optional

class UserDetail(BaseModel):
    user_id: int
    user: str
    user_email: str

class RoleMasterBase(BaseModel):
    role: Optional[str] = None
    user: Optional[List[UserDetail]] = None  # changed from List[str]
    role_id: Optional[int] = None
    remarks: Optional[str] = None

class RoleMasterCreate(RoleMasterBase):
    pass

class RoleMasterUpdate(RoleMasterBase):
    pass

# Output model (for API responses)
class RoleMasterResponse(BaseModel):
    id: int
    role: Optional[str] = None
    user: Optional[List[UserDetail]] = None  # changed from List[str]
    role_id: Optional[int] = None
    remarks: Optional[str] = None

    class Config:
        from_attributes = True