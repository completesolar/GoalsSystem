from pydantic import BaseModel
from typing import Optional


class ActionBase(BaseModel):
    action: Optional[str] = None


class ActionCreate(ActionBase):
    pass


class ActionUpdate(ActionBase):
    pass


class ActionResponse(ActionBase):
    id: int

    class Config:
        from_attributes = True
