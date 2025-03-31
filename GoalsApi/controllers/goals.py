from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.schema import Goals,GoalsResponse, GoalsUpdate
from database import get_db
from crud import create_goal,get_goals_by_id,get_all_goals,update_goal

router = APIRouter()

@router.post("/api/goals/", response_model=GoalsResponse)
def create_goals(goal: Goals, db: Session = Depends(get_db)):
    return create_goal(db=db, goal=goal)

@router.get("/api/goals/{goalid}", response_model=GoalsResponse)
def read_goal(goalid: int, db: Session = Depends(get_db)):
    db_goal = get_goals_by_id(db, goalid=goalid)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal

@router.get("/api/goals/", response_model= list[GoalsResponse])
def read_goals(db: Session = Depends(get_db)):
    return get_all_goals(db)

@router.put("/api/goals/{goalid}", response_model=GoalsUpdate)
def update_goals(goalid: int, goal_update: GoalsUpdate, db: Session = Depends(get_db)):
    return update_goal(db=db, goal_id=goalid, goal_update=goal_update)