from pydantic import BaseModel
from typing import List, Optional

class who(BaseModel):
     who: str
     class Config:
        from_attributes  = True
class whoCreate(who):
     who: str

class whoUpdate(who):
     who: Optional[str] = None

class whoResponse:
     id: int
     who: str