from pydantic import BaseModel, ConfigDict, field_serializer
from typing import List, Optional
from datetime import datetime

@field_serializer("createddatetime", "updateddatetime", mode="plain")
def serialize_datetime(v: Optional[datetime], _info):
    return v.isoformat() if v else None

class Goals(BaseModel):
    who: Optional[str]
    p: Optional[int]
    proj: Optional[str]
    vp: Optional[str]
    b: Optional[int]
    e: Optional[int]
    d: Optional[str]
    s: Optional[str]
    action: Optional[str]
    memo: Optional[str]  # new field
    fiscalyear: Optional[int]
    updateBy: Optional[str]
    createddatetime: datetime
    updateddatetime: datetime
    description: Optional[str] # Allow None values

    class Config:
        from_attributes  = True

     

class GoalsCreate(Goals):
     who: Optional[str]
     p: Optional[int]
     proj: Optional[str]
     vp: Optional[str]
     b: Optional[int]
     e: Optional[int]
     d: Optional[str]
     s: Optional[str]
     action: Optional[str]
     memo: Optional[str]  # new field
     fiscalyear: Optional[int]
     updateBy: Optional[str]
     createddatetime: datetime
     updateddatetime: datetime
     description: Optional[str]
     
class GoalsUpdate(Goals):
     who: Optional[str] = None
     p: Optional[int] = None
     proj: Optional[str] = None
     vp: Optional[str] = None
     b: Optional[int] = None
     e: Optional[int] = None
     d: Optional[str] = None
     s: Optional[str] = None
     action: Optional[str] = None
     memo: Optional[str] = None
     updateBy: Optional[str] = None
     createddatetime: Optional[datetime] = None
     updateddatetime: Optional[datetime] = None
     description: Optional[str] = None 
     
class GoalsResponse(BaseModel):
    goalid: int
    who: Optional[str]
    p: Optional[int]
    proj: Optional[str]
    vp: Optional[str]
    b: Optional[int]
    e: Optional[int]
    d: Optional[str]
    s: Optional[str]
    action: Optional[str]
    memo: Optional[str]
    fiscalyear: Optional[int]
    updateBy: Optional[str]
    createddatetime: datetime
    updateddatetime: datetime
    description: Optional[str]

    class Config:
        from_attributes = True
