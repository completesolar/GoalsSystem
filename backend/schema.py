from pydantic import BaseModel, ConfigDict, field_serializer
from typing import List, Optional
from datetime import datetime

@field_serializer("createddatetime", "updateddatetime", mode="plain")
def serialize_datetime(v: Optional[datetime], _info):
    return v.isoformat() if v else None

class Goals(BaseModel):
     who: str
     p: int
     proj: str
     vp: str
     b: int
     e: str
     d: str
     s: str
     gdb: str
     fiscalyear: int
     updateBy: str
     createddatetime: datetime
     updateddatetime: datetime
     description: Optional[str]  # Allow None values

     class Config:
        from_attributes  = True

     

class GoalsCreate(Goals):
     who: str
     p: int
     proj: str
     vp: str
     b: int
     e: str
     d: str
     s: str
     gdb: str
     fiscalyear: int
     updateBy: str
     createddatetime: str
     updateddatetime: str  # Ensure this is present
     description: Optional[str] = None
     
class GoalsUpdate(Goals):
     who: Optional[str] = None
     p: Optional[int] = None
     proj: Optional[str] = None
     vp: Optional[str] = None
     b: Optional[int] = None
     e: Optional[str] = None
     d: Optional[str] = None
     s: Optional[str] = None
     gdb: Optional[str] = None
     updateBy: Optional[str] = None
     createddatetime: Optional[datetime] = None
     updateddatetime: Optional[datetime] = None
     description: Optional[str] = None 
     
class GoalsResponse(Goals):
     goalid: int
     class Config:
        from_attributes  = True