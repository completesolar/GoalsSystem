from pydantic import BaseModel
from typing import List, Optional

class RoleMasterBase(BaseModel):
    role: Optional[str] = None
    user: Optional[List[str]] = None       # Only for input (create/update)
    user_id: Optional[List[int]] = None    # Only for input
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
    user: Optional[List[str]] = None 
    user_id: Optional[List[int]] = None 
    role_id: Optional[int] = None
    remarks: Optional[str] = None

    class Config:
        from_attributes = True 
