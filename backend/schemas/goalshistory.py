from pydantic import BaseModel, field_serializer
from typing import List, Optional
from datetime import datetime

@field_serializer("createddatetime", "updateddatetime", mode="plain")
def serialize_datetime(v: Optional[datetime], _info):
    return v.isoformat() if v else None

class goalshistory(BaseModel):
    id: int
    goalid: int
    createddate: Optional[datetime] = None
    createdby: Optional[str] = None
    who: Optional[str] = None
    p: Optional[int] = None
    proj: Optional[str] = None
    vp: Optional[str] = None
    b: Optional[int] = None
    e: Optional[str] = None
    d: Optional[str] = None
    s: Optional[str] = None
    action: Optional[str] = None
    memo: Optional[str] = None
    fiscalyear: Optional[int] = None
    updateBy: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True

class goalhistoryCreate(goalshistory):
    id: int
    oldgoal: str
    newgoal: str
    createddate: str
    createdby: str

class goalhistoryResponse(goalshistory):  # Inherit from BaseModel
     id: int

     class Config:
          from_attributes = True
