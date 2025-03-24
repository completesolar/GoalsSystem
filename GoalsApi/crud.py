from sqlalchemy.orm import Session
# from schemas.schema import Goals
from models.models import Goals, Who , Proj, Vp, Status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from schemas.schema import GoalsResponse,GoalsUpdate  # Pydantic schema
from fastapi.encoders import jsonable_encoder
from sqlalchemy.sql import text
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_goal(db: Session, goal: Goals):
    db_goal = Goals(who=goal.who, p=goal.p, proj=goal.proj, vp=goal.vp, b=goal.b, e=goal.e, d=goal.d, s=goal.s, gdb=goal.gdb, fiscalyear=goal.fiscalyear, updateBy=goal.updateBy)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def get_goals_by_id(db: Session, goalid: int):
    return db.query(Goals).filter(Goals.goalid == goalid).first()

def get_all_goals(db: Session,response_model =list[GoalsResponse]):
    db_goals = db.query(Goals).order_by(Goals.goalid.desc()).all()
    # Convert each SQLAlchemy model to a Pydantic model before returning
    return jsonable_encoder(db_goals)

def create_who(db: Session, who: str):
    db_who = Who(who=who)
    db.add(db_who)
    db.commit()
    db.refresh(db_who)
    return db_who

def create_proj(db: Session, proj: str):
    db_proj = Proj(proj=proj)
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj
def update_goal(db: Session, goal_id: int, goal_update: GoalsUpdate):
    # Step 1: Retrieve the goal from the database
    db_goal = db.query(Goals).filter(Goals.goalid == goal_id).first()

    if db_goal is None:
        return "Goal not found"
    
    # Step 2: Update the goal's fields with the new data
    if goal_update.who is not None:
        db_goal.who = goal_update.who
    if goal_update.p is not None:
        db_goal.p = goal_update.p
    if goal_update.proj is not None:
        db_goal.proj = goal_update.proj
    if goal_update.vp is not None:
        db_goal.vp = goal_update.vp
    if goal_update.b is not None:
        db_goal.b = goal_update.b
    if goal_update.e is not None:
        db_goal.e = goal_update.e
    if goal_update.d is not None:
        db_goal.d = goal_update.d
    if goal_update.s is not None:
        db_goal.s = goal_update.s
    if goal_update.gdb is not None:
        db_goal.gdb = goal_update.gdb
    if goal_update.fiscalyear is not None:
        db_goal.fiscalyear = goal_update.fiscalyear
    if goal_update.updateBy is not None:
        db_goal.updateBy = goal_update.updateBy

    # Step 3: Commit the changes to the database
    db.commit()

    # Step 4: Refresh the object from the database to return updated data
    db.refresh(db_goal)

    return db_goal