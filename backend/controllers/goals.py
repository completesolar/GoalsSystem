from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.orm import Session
from schemas.schema import Goals, GoalsResponse, GoalsUpdate
from schemas.goalshistory import goalshistory, goalhistoryResponse
from schemas.who import WhoCreate, WhoResponse
from schemas.status import StatusCreate, StatusUpdate, StatusResponse
from schemas.proj import ProjResponse
from schemas.vp import VPResponse
from schemas.p import PCreate, PResponse, PUpdate
from schemas.b import BResponse,BCreate,BUpdate
from schemas.e import EResponse,ECreate,EUpdate
from schemas.d import DResponse,DUpdate,DCreate
from schemas.action import ActionResponse
from typing import Optional
from database import get_db
from crud import (
    create_goal,
    get_goals_by_id,
    get_all_goals,
    update_goal,
    get_all_goals_history,
    get_goalshistory_by_id,
    get_all_who,
    get_who_by_id,
    create_who,
    # update_who,
    get_all_status,
    get_status_by_id,
    create_status_entry,
    get_all_proj,
    get_all_vp,
    get_all_p,
    get_all_b,
    get_all_e,
    get_all_d,
    get_action,
    update_p,
    create_p,
    get_goals_metrics,
    create_b,
    update_b,
    create_E,
    update_E,
    create_D,
    update_D,
    get_B_by_id,
    get_E_by_id,
    get_D_by_id,
    update_status
)
from typing import Annotated

router = APIRouter()


@router.get("/api/p", response_model=list[PResponse])
def read_p(db: Session = Depends(get_db)):
    return get_all_p(db)

@router.get("/api/vp", response_model=list[VPResponse])
def read_vp(db: Session = Depends(get_db)):
    return get_all_vp(db)

@router.get("/api/proj", response_model=list[ProjResponse])
def read_proj(db: Session = Depends(get_db)):
    return get_all_proj(db)

@router.get("/api/who", response_model=list[WhoResponse])
def read_who(db: Session = Depends(get_db)):
    return get_all_who(db)

@router.post("/api/who", response_model=WhoCreate)
def create_whos(who: WhoCreate, db: Session = Depends(get_db)):
    return create_who(db=db, who=who)

@router.get("/api/who/{id}", response_model=WhoResponse)
def read_who(id: int, db: Session = Depends(get_db)):
    db_who = get_who_by_id(db, id=id)
    if db_who is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_who

# @router.put("/api/who/{id}", response_model=GoalsUpdate)
# def update_whos(id: int, who_update: GoalsUpdate, db: Session = Depends(get_db)):
#     return update_who(db=db, who_id=id, who_update=who_update)

@router.post("/api/goals", response_model=GoalsResponse)
def create_goals(goal: Goals, db: Session = Depends(get_db)):
    return create_goal(db=db, goal=goal)

@router.get("/api/goals", response_model=list[GoalsResponse])
def read_goals(db: Session = Depends(get_db)):
    return get_all_goals(db)

@router.get("/api/goals/metrics")
def read_goals_metrics(
    vp: Optional[str] = None,
    proj: Optional[str] = None,
    priority: Optional[int] = None,
    created_from: Optional[str] = None,
    created_to: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_goals_metrics(
        db=db,
        vp=vp,
        proj=proj,
        priority=priority,
        created_from=created_from,
        created_to=created_to
    )

@router.get("/api/goals/{goalid}", response_model=GoalsResponse)
def read_goal(goalid: int, db: Session = Depends(get_db)):
    db_goal = get_goals_by_id(db, goalid=goalid)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal

@router.put("/api/goals/{goalid}", response_model=GoalsUpdate)
def update_goals(goalid: int, goal_update: GoalsUpdate, db: Session = Depends(get_db)):
    return update_goal(db=db, goal_id=goalid, goal_update=goal_update)

@router.get("/api/goalshistory/{goalid}", response_model=list[goalhistoryResponse])
async def get_goalshistory(goalid: int, db: Session = Depends(get_db)):
    records = get_goalshistory_by_id(db, goalid=goalid)
    return [goalhistoryResponse.model_validate(record).model_dump() for record in records]



@router.get("/api/goalshistory", response_model=list[goalhistoryResponse])
def read_goals_history(db: Session = Depends(get_db)):
    return get_all_goals_history(db)

@router.get("/api/action", response_model=list[ActionResponse])
def read_action(db: Session = Depends(get_db)):
    return get_action(db)

@router.post("/api/p", response_model=PResponse)
def create_p_endpoint(p: PCreate, db: Session = Depends(get_db)):
    return create_p(db=db, p_data=p)

@router.put("/api/p/{id}", response_model=PResponse)
def update_p_endpoint(id: int, p: PUpdate, db: Session = Depends(get_db)):
    db_p = update_p(db=db, id=id, p_data=p)
    if not db_p:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_p

# status
@router.get("/api/status", response_model=list[StatusResponse])
def read_status(db: Session = Depends(get_db)):
    return get_all_status(db)

@router.post("/api/status", response_model=StatusResponse)
def create_status(status: StatusCreate, db: Session = Depends(get_db)):
    return create_status_entry(db=db, status=status)

@router.get("/api/status/{id}", response_model=StatusResponse)
def read_status(id: int, db: Session = Depends(get_db)):
    db_status = get_status_by_id(db, id=id)
    if db_status is None:
        raise HTTPException(status_code=404, detail="Status not found")
    return db_status

@router.put("/api/status/{id}", response_model=StatusResponse)
def update_status_route(id: int, status_update: StatusUpdate, db: Session = Depends(get_db)):
    updated = update_status(db=db, id=id, status_data=status_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Status not found")
    return updated

# B
@router.get("/api/b", response_model=list[BResponse])
def read_b(db: Session = Depends(get_db)):
    return get_all_b(db)

@router.post("/api/b", response_model=BResponse)
def create_B(b: BCreate, db: Session = Depends(get_db)):
    return create_b(db=db, b=b)

@router.get("/api/b/{id}", response_model=BResponse)
def read_b(id: int, db: Session = Depends(get_db)):
    db_b = get_B_by_id(db, id=id)
    if db_b is None:
        raise HTTPException(b_code=404, detail="B not found")
    return db_b

@router.put("/api/b/{id}", response_model=BResponse)
def update_b_endpoint(id: int, b: BUpdate, db: Session = Depends(get_db)):
    db_b = update_b(db=db, id=id, b_data=b)
    if not db_b:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_b

# E
@router.get("/api/e", response_model=list[EResponse])
def read_e(db: Session = Depends(get_db)):
    return get_all_e(db)

@router.post("/api/e", response_model=EResponse)
def create_e(e: ECreate, db: Session = Depends(get_db)):
    return create_E(db=db, e=e)

@router.get("/api/e/{id}", response_model=EResponse)
def read_(id: int, db: Session = Depends(get_db)):
    db_e = get_E_by_id(db, id=id)
    if db_e is None:
        raise HTTPException(b_code=404, detail="B not found")
    return db_e

@router.put("/api/e/{id}", response_model=BUpdate)
def update_e(id: int, b_update: EUpdate, db: Session = Depends(get_db)):
    return update_E(db=db, id=id, b_update=b_update)

# D
@router.get("/api/d", response_model=list[DResponse])
def read_d(db: Session = Depends(get_db)):
    return get_all_d(db)

@router.post("/api/d", response_model=DResponse)
def create_d(D: DCreate, db: Session = Depends(get_db)):
    return create_D(db=db, D=D)

@router.get("/api/d/{id}", response_model=DResponse)
def read_D(id: int, db: Session = Depends(get_db)):
    db_D = get_D_by_id(db, id=id)
    if db_D is None:
        raise HTTPException(D_code=404, detail="D not found")
    return db_D

@router.put("/api/d/{id}", response_model=DUpdate)
def update_d(id: int, D_update: DUpdate, db: Session = Depends(get_db)):
    return update_D(db=db, id=id, D_update=D_update)
