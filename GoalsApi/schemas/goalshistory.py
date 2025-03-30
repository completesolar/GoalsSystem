from pydantic import BaseModel
from typing import List, Optional

class goalshistory(BaseModel):
     goalid: int
     oldgoal: str
     newgoal: str
     createddate: str
     createdby: str
     class Config:
        from_attributes  = True
class goalhistoryCreate(goalshistory):
     goalid: int
     oldgoal: str
     newgoal: str
     createddate: str
     createdby: str
class goalhistoryResponse:
     id: int
     goalid: int
     oldgoal: str
     newgoal: str
     createddate: str
     createdby: str