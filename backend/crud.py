from sqlalchemy.orm import Session

# from schemas.schema import Goals
from models.models import Goals, Who, Proj, VP, Status, goalshistory, P, B, E, D, Action
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from schemas.schema import GoalsResponse, GoalsUpdate  # Pydantic schema
from schemas.goalshistory import goalhistoryResponse
from schemas.who import WhoResponse
from schemas.action import ActionResponse
from schemas.status import StatusUpdate, StatusResponse
from schemas.proj import ProjResponse
from schemas.vp import VPResponse
from schemas.p import PCreate, PResponse, PUpdate
from schemas.b import BResponse,BCreate,BUpdate
from schemas.e import EResponse,EUpdate,ECreate
from schemas.d import DResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.sql import text
from json import dumps, loads
from datetime import datetime
from copy import deepcopy
from sqlalchemy import func,extract

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_all_b(db: Session, response_model=list[BResponse]):
    db_b = db.query(B).order_by(B.id.desc()).all()
    return jsonable_encoder(db_b)

def get_all_e(db: Session, response_model=list[EResponse]):
    db_e = db.query(E).order_by(E.id.desc()).all()
    return jsonable_encoder(db_e)

def get_all_d(db: Session, response_model=list[DResponse]):
    db_d = db.query(D).order_by(D.id.desc()).all()
    return jsonable_encoder(db_d)

def get_all_p(db: Session, response_model=list[PResponse]):
    db_p = db.query(P).order_by(P.id.desc()).all()
    return jsonable_encoder(db_p)

def get_all_vp(db: Session, response_model=list[VPResponse]):
    db_vp = db.query(VP).order_by(VP.id.desc()).all()
    return jsonable_encoder(db_vp)

def get_all_proj(db: Session, response_model=list[ProjResponse]):
    db_proj = db.query(Proj).order_by(Proj.id.desc()).all()
    return jsonable_encoder(db_proj)

def get_all_status(db: Session, response_model=list[StatusResponse]):
    db_status = db.query(Status).order_by(Status.id.desc()).all()
    return jsonable_encoder(db_status)

def create_status_entry(db: Session, status: Status):
    db_status = Status(**status.dict())
    db.add(db_status)
    db.commit()
    db.refresh(db_status)
    return db_status

def get_all_status(db: Session):
    return db.query(Status).all()

def get_status_by_id(db: Session, id: int):
    return db.query(Status).filter(Status.id == id).first()

def get_B_by_id(db: Session, id: int):
    return db.query(B).filter(B.id == id).first()

def get_E_by_id(db: Session, id: int):
    return db.query(E).filter(E.id == id).first()

def get_D_by_id(db: Session, id: int):
    return db.query(D).filter(D.id == id).first()

def update_status_entry(db: Session, id: int, status_update: StatusUpdate):
    db_status = db.query(Status).filter(Status.id == id).first()
    if db_status:
        for key, value in status_update.dict(exclude_unset=True).items():
            setattr(db_status, key, value)
        db.commit()
        db.refresh(db_status)
    return db_status

def get_all_who(db: Session, response_model=list[WhoResponse]):
    db_who = db.query(Who).order_by(Who.id.desc()).all()
    return jsonable_encoder(db_who)


def get_action(db: Session):
    db_action = db.query(Action).order_by(Action.id.desc()).all()
    print("Fetched actions:", db_action)
    return jsonable_encoder(db_action)


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
        action=goal.action,
        memo=goal.memo,
        description=goal.description,
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
        action=goal.action,
        memo=goal.memo,
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

def get_who_by_id(db: Session, id: int):
    return db.query(Who).filter(Who.id == id).first()

def create_who(db: Session, who: str):
    db_who = Who(
        slno=who.slno,
        ee_id=who.ee_id,
        last_name=who.last_name,
        first_name=who.first_name,
        middle_name=who.middle_name,
        decoder=who.decoder,
        mobile=who.mobile,
        work_email=who.work_email,
        title=who.title
    )
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

def create_p(db: Session, p_data: PCreate):
    db_p = P(**p_data.dict())
    db.add(db_p)
    db.commit()
    db.refresh(db_p)
    return db_p

def create_p(db: Session, p_data: PCreate):
    db_p = P(**p_data.dict())
    db.add(db_p)
    db.commit()
    db.refresh(db_p)
    return db_p

def update_p(db: Session, id: int, p_data: PUpdate):
    print("p_data",p_data)
    db_p = db.query(P).filter(P.id == id).first()
    if not db_p:
        return None
    for key, value in p_data.dict(exclude_unset=True).items():
        setattr(db_p, key, value)
    db.commit()
    db.refresh(db_p)
    return db_p

def update_goal(db: Session, goal_id: int, goal_update: GoalsUpdate):
    currentdate = datetime.now()

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
    if goal_update.action is not None:
        db_goal.action = goal_update.action
    if goal_update.memo is not None:
        db_goal.memo = goal_update.memo
    if goal_update.description is not None:
        db_goal.description = goal_update.description
    if goal_update.fiscalyear is not None:
        db_goal.fiscalyear = goal_update.fiscalyear
    if goal_update.updateBy is not None:
        db_goal.updateBy = goal_update.updateBy

    # Step 3: Commit the changes to the database
    db.commit()
    db.refresh(db_goal)

    # Step 4: Insert into goalshistory
    db_goalhistory = goalshistory(
        goalid=goal_id,
        createddate=currentdate,
        createdby=goal_update.updateBy,
        who=db_goal.who,
        p=db_goal.p,
        proj=db_goal.proj,
        vp=db_goal.vp,
        b=db_goal.b,
        e=db_goal.e,
        d=db_goal.d,
        s=db_goal.s,
        action=db_goal.action,
        memo=db_goal.memo,
        fiscalyear=db_goal.fiscalyear,
        updateBy=db_goal.updateBy,
        description=db_goal.description
    )

    db.add(db_goalhistory)
    db.commit()
    db.refresh(db_goalhistory)

    return db_goal

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
    if goal_update.action is not None:
        db_goal.action = goal_update.action
    if goal_update.memo is not None:
        db_goal.memo = goal_update.memo    
    if goal_update.description is not None:
        db_goal.description = goal_update.description            
    if goal_update.fiscalyear is not None:
        db_goal.fiscalyear = goal_update.fiscalyear
    if goal_update.updateBy is not None:
        db_goal.updateBy = goal_update.updateBy

    # Step 3: Commit the changes to the database
    db.commit()

    # Step 4: Refresh the object from the database to return updated data
    db.refresh(db_goal)
    return db_goal

# def update_who(db: Session, goal_id: int, goal_update: GoalsUpdate):
#     currentdate = datetime.now()
#     # Step 1: Retrieve the goal from the database
#     db_goal = db.query(Goals).filter(Goals.goalid == goal_id).first()
#     old_goal = deepcopy(db_goal)  # Create a copy of the old goal for history
#     if db_goal is None:
#         return "Goal not found"

#     # Step 2: Update the goal's fields with the new data
#     if goal_update.who is not None:
#         db_goal.who = goal_update.who
#     if goal_update.p is not None:
#         db_goal.p = goal_update.p
#     if goal_update.proj is not None:
#         db_goal.proj = goal_update.proj
#     if goal_update.vp is not None:
#         db_goal.vp = goal_update.vp
#     if goal_update.b is not None:
#         db_goal.b = goal_update.b
#     if goal_update.e is not None:
#         db_goal.e = goal_update.e
#     if goal_update.d is not None:
#         db_goal.d = goal_update.d
#     if goal_update.s is not None:
#         db_goal.s = goal_update.s
#     if goal_update.gdb is not None:
#         db_goal.gdb = goal_update.gdb
#     if goal_update.fiscalyear is not None:
#         db_goal.fiscalyear = goal_update.fiscalyear
#     if goal_update.updateBy is not None:
#         db_goal.updateBy = goal_update.updateBy

#     # Step 3: Commit the changes to the database
#     db.commit()

#     # Step 4: Refresh the object from the database to return updated data
#     db.refresh(db_goal)

#     # Use jsonable_encoder to convert the objects to dictionaries
#     # old_goal_dict = jsonable_encoder(old_goal)
#     # updated_goal_dict = jsonable_encoder(db_goal)

#     db_goalhistory = goalshistory(
#         goalid=goal_id,
#         createddate=currentdate,
#         createdby=goal_update.updateBy,
#         who=goal_update.who,
#         p=goal_update.p,
#         proj=goal_update.proj,
#         vp=goal_update.vp,
#         b=goal_update.b,
#         e=goal_update.e,
#         d=goal_update.d,
#         s=goal_update.s,
#         gdb=goal_update.gdb,
#         fiscalyear=goal_update.fiscalyear,
#         updateBy=goal_update.updateBy,
#         description=goal_update.description
#     )

#     db.add(db_goalhistory)
#     db.commit()
#     db.refresh(db_goalhistory)

#     return db_goal

    # goalid=goal_id,
    #     oldgoal=dumps(old_goal_dict),  # Serialize the old goal to JSON
    #     newgoal=dumps(updated_goal_dict),  # Serialize the updated goal to JSON
    #     createddate=currentdate,
    #     createdby=goal_update.updateBy

def get_goals_metrics(db: Session, vp=None, proj=None, priority=None, created_from=None, created_to=None):
    query = db.query(Goals)

    if vp:
        query = query.filter(Goals.vp == vp)
    if proj:
        query = query.filter(Goals.proj == proj)
    if priority:
        query = query.filter(Goals.p == priority)
    if created_from:
        query = query.filter(Goals.createddatetime >= created_from)
    if created_to:
        query = query.filter(Goals.createddatetime <= created_to)

    # Year-wise goals using fiscalyear (already a column)
    yearwise_data = query.with_entities(
        Goals.fiscalyear,
        func.count().label('count')
    ).group_by(Goals.fiscalyear).order_by(Goals.fiscalyear).all()

    # Status-wise goals
    statuswise_data = query.with_entities(
        Goals.s,
        func.count().label('count')
    ).group_by(Goals.s).all()

    return {
        "yearWise": [{"year": row.fiscalyear, "count": row.count} for row in yearwise_data],
        "statusWise": [{"status": row.s or "Unassigned", "count": row.count} for row in statuswise_data]
    }

def create_B(db: Session, b_data: BCreate):
    db_b = B(**b_data.dict())
    db.add(db_b)
    db.commit()
    db.refresh(db_b)
    return db_b

def update_B(db: Session, id: int, b_data: BUpdate):
    db_b = db.query(B).filter(B.id == id).first()
    if not db_b:
        return None
    for key, value in b_data.dict(exclude_unset=True).items():
        setattr(db_b, key, value)
    db.commit()
    db.refresh(db_b)
    return db_b


def create_E(db: Session, e_data: ECreate):
    db_e = E(**e_data.dict())
    db.add(db_e)
    db.commit()
    db.refresh(db_e)
    return db_e

def update_E(db: Session, id: int, e_data: EUpdate):
    db_e = db.query(E).filter(E.id == id).first()
    if not db_e:
        return None
    for key, value in e_data.dict(exclude_unset=True).items():
        setattr(db_e, key, value)
    db.commit()
    db.refresh(db_e)
    return db_e


def create_D(db: Session, d_data: ECreate):
    db_d = D(**d_data.dict())
    db.add(db_d)
    db.commit()
    db.refresh(db_d)
    return db_d


def update_D(db: Session, id: int, e_data: EUpdate):
    db_d = db.query(D).filter(D.id == id).first()
    if not db_d:
        return None
    for key, value in e_data.dict(exclude_unset=True).items():
        setattr(db_d, key, value)
    db.commit()
    db.refresh(db_d)
    return db_d
