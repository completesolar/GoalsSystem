from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.schema import Goals, GoalsResponse, GoalsUpdate
from schemas.goalshistory import goalshistory, goalhistoryResponse
from schemas.who import WhoResponse
from schemas.status import StatusResponse
from schemas.proj import ProjResponse
from schemas.vp import VPResponse
from schemas.p import PResponse
from schemas.b import BResponse
from schemas.e import EResponse
from schemas.d import DResponse
from database import get_db
from crud import (
    create_goal,
    get_goals_by_id,
    get_all_goals,
    update_goal,
    get_all_goals_history,
    get_goalshistory_by_id,
    get_all_who,
    get_all_status,
    get_all_proj,
    get_all_vp,
    get_all_p,
    get_all_b,
    get_all_e,
    get_all_d,
)
from typing import Annotated

router = APIRouter()


@router.get("/api/b", response_model=list[BResponse])
def read_b(db: Session = Depends(get_db)):
    return get_all_b(db)


@router.get("/api/e", response_model=list[EResponse])
def read_e(db: Session = Depends(get_db)):
    return get_all_e(db)


@router.get("/api/d", response_model=list[DResponse])
def read_d(db: Session = Depends(get_db)):
    return get_all_d(db)


@router.get("/api/p", response_model=list[PResponse])
def read_p(db: Session = Depends(get_db)):
    return get_all_p(db)


@router.get("/api/vp", response_model=list[VPResponse])
def read_vp(db: Session = Depends(get_db)):
    return get_all_vp(db)


@router.get("/api/proj", response_model=list[ProjResponse])
def read_proj(db: Session = Depends(get_db)):
    return get_all_proj(db)


@router.get("/api/status", response_model=list[StatusResponse])
def read_status(db: Session = Depends(get_db)):
    return get_all_status(db)


@router.get("/api/who", response_model=list[WhoResponse])
def read_who(db: Session = Depends(get_db)):
    return get_all_who(db)


@router.post("/api/goals", response_model=GoalsResponse)
def create_goals(goal: Goals, db: Session = Depends(get_db)):
    # print("goal", goal)
    return create_goal(db=db, goal=goal)


@router.get("/api/goals/{goalid}", response_model=GoalsResponse)
def read_goal(goalid: int, db: Session = Depends(get_db)):
    db_goal = get_goals_by_id(db, goalid=goalid)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.get("/api/goalshistory/{goalid}", response_model=list[goalhistoryResponse])
async def get_goalshistory(goalid: int, db: Session = Depends(get_db)):
    records = get_goalshistory_by_id(db, goalid=goalid)
    return [
        goalhistoryResponse.model_validate(record).model_dump() for record in records
    ]


@router.get("/api/goals", response_model=list[GoalsResponse])
def read_goals(db: Session = Depends(get_db)):
    return get_all_goals(db)


@router.get("/api/goalshistory", response_model=list[goalhistoryResponse])
def read_goals_history(db: Session = Depends(get_db)):
    return get_all_goals_history(db)


@router.put("/api/goals/{goalid}", response_model=GoalsUpdate)
def update_goals(goalid: int, goal_update: GoalsUpdate, db: Session = Depends(get_db)):
    return update_goal(db=db, goal_id=goalid, goal_update=goal_update)
