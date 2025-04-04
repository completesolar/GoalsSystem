from sqlalchemy.orm import Session

# from schemas.schema import Goals
from models.models import Goals, Who, Proj, Vp, Status, goalshistory
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from schemas.schema import GoalsResponse, GoalsUpdate  # Pydantic schema
from schemas.goalshistory import goalhistoryResponse
from schemas.who import WhoResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.sql import text
from json import dumps, loads
from datetime import datetime
from copy import deepcopy

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_all_who(db: Session, response_model=list[WhoResponse]):
    db_who = db.query(Who).order_by(Who.id.desc()).all()
    return jsonable_encoder(db_who)


def create_goal(db: Session, goal: Goals):
    currentdate = datetime.now()
    db_goal = Goals(
        who=goal.who,
        p=goal.p,
        proj=goal.proj,
        vp=goal.vp,
        b=goal.b,
        e=goal.e,
        d=goal.d,
        s=goal.s,
        gdb=goal.gdb,
        fiscalyear=goal.fiscalyear,
        updateBy=goal.updateBy,
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)

    db_goalhistory = goalshistory(
        goalid=db_goal.goalid,
        createddate=currentdate,
        createdby=goal.updateBy,
        who=goal.who,
        p=goal.p,
        proj=goal.proj,
        vp=goal.vp,
        b=goal.b,
        e=goal.e,
        d=goal.d,
        s=goal.s,
        gdb=goal.gdb,
        fiscalyear=goal.fiscalyear,
        updateBy=goal.updateBy,
        description=goal.description,
    )  # Assuming you want to store the initial state in history
    db.add(db_goalhistory)
    db.commit()
    db.refresh(db_goalhistory)

    return db_goal


def add_to_history(
    db: Session,
    goalid: int,
    oldgoal: str,
    newgoal: str,
    createddate: str,
    createdby: str,
):
    db_goalshistory = goalshistory(
        goalid=goalid,
        oldgoal=oldgoal,
        newgoal=newgoal,
        createddate=createddate,
        createdby=createdby,
    )
    db.add(db_goalshistory)
    db.commit()
    db.refresh(db_goalshistory)
    return db_goalshistory


def get_goals_by_id(db: Session, goalid: int):
    return db.query(Goals).filter(Goals.goalid == goalid).first()

def get_goalshistory_by_id(db: Session, goalid: int):
    return db.query(goalshistory).filter(goalshistory.goalid == goalid).all()

def get_all_goals(db: Session, response_model=list[GoalsResponse]):
    db_goals = db.query(Goals).order_by(Goals.goalid.desc()).all()
    return jsonable_encoder(db_goals)

def get_all_goals_history(db: Session, response_model=list[goalhistoryResponse]):
    db_goalshistory = db.query(goalshistory).order_by(goalshistory.goalid.desc()).all()
    return jsonable_encoder(db_goalshistory)


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
    currentdate = datetime.now()
    # Step 1: Retrieve the goal from the database
    db_goal = db.query(Goals).filter(Goals.goalid == goal_id).first()
    old_goal = deepcopy(db_goal)  # Create a copy of the old goal for history
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

    # Use jsonable_encoder to convert the objects to dictionaries
    # old_goal_dict = jsonable_encoder(old_goal)
    # updated_goal_dict = jsonable_encoder(db_goal)

    db_goalhistory = goalshistory(
        goalid=goal_id,
        createddate=currentdate,
        createdby=goal_update.updateBy,
        who=goal_update.who,
        p=goal_update.p,
        proj=goal_update.proj,
        vp=goal_update.vp,
        b=goal_update.b,
        e=goal_update.e,
        d=goal_update.d,
        s=goal_update.s,
        gdb=goal_update.gdb,
        fiscalyear=goal_update.fiscalyear,
        updateBy=goal_update.updateBy,
        description=goal_update.description
    )

    db.add(db_goalhistory)
    db.commit()
    db.refresh(db_goalhistory)

    return db_goal

    # goalid=goal_id,
    #     oldgoal=dumps(old_goal_dict),  # Serialize the old goal to JSON
    #     newgoal=dumps(updated_goal_dict),  # Serialize the updated goal to JSON
    #     createddate=currentdate,
    #     createdby=goal_update.updateBy
