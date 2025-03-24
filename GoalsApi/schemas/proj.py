from pydantic import BaseModel
from typing import List, Optional

class proj(BaseModel):
     proj: str
     class Config:
        from_attributes  = True
class projCreate(proj):
     proj: str

class projUpdate(proj):
     proj: Optional[str] = None

class projResponse:
     id: int
     proj: str