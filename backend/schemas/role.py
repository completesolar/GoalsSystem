from pydantic import BaseModel
from typing import Optional

class RoleBase(BaseModel):
    role: Optional[str] = None
    status: Optional[int] = None
    remarks: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    pass

class RoleResponse(RoleBase):
    id: int

    class Config:
        from_attributes = True
