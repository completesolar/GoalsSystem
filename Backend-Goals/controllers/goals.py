from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.schema import Goals, GoalsResponse, GoalsUpdate
from schemas.goalshistory import goalshistory, goalhistoryResponse
from schemas.who import WhoResponse
from database import get_db
from crud import (
    create_goal,
    get_goals_by_id,
    get_all_goals,
    update_goal,
    get_all_goals_history,
    get_goalshistory_by_id,
    get_all_who
)
from typing import Annotated

router = APIRouter()


@router.get("/api/who/", response_model=list[WhoResponse])
def read_who(db: Session = Depends(get_db)):
    return get_all_who(db)


@router.post("/api/goals/", response_model=GoalsResponse)
def create_goals(goal: Goals, db: Session = Depends(get_db)):
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
    return [goalhistoryResponse.model_validate(record).model_dump() for record in records]

@router.get("/api/goals/", response_model=list[GoalsResponse])
def read_goals(db: Session = Depends(get_db)):
    return get_all_goals(db)

@router.get("/api/goalshistory/", response_model=list[goalhistoryResponse])
def read_goals_history(db: Session = Depends(get_db)):
    return get_all_goals_history(db)

@router.put("/api/goals/{goalid}", response_model=GoalsUpdate)
def update_goals(goalid: int, goal_update: GoalsUpdate, db: Session = Depends(get_db)):
    return update_goal(db=db, goal_id=goalid, goal_update=goal_update)
