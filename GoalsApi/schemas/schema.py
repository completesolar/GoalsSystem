from pydantic import BaseModel
from typing import List, Optional

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
class GoalsResponse(Goals):
     goalid: int
     class Config:
        from_attributes  = True