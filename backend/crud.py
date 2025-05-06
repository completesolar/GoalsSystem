import difflib
from typing import Dict, List
from zoneinfo import ZoneInfo
import pytz
from sqlalchemy.orm import Session
from dateutil import tz

# from schemas.schema import Goals
from models.models import Goals, Who, Proj, VP, Status, goalshistory, P, B, E, D, Action,Role
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from schemas.schema import GoalsResponse, GoalsUpdate  # Pydantic schema
from schemas.goalshistory import goalhistoryResponse
from schemas.who import WhoResponse
from schemas.action import ActionResponse
from schemas.status import StatusUpdate, StatusResponse,StatusCreate
from schemas.proj import ProjResponse,ProjCreate,ProjUpdate
from schemas.vp import VPResponse
from schemas.p import PCreate, PResponse, PUpdate
from schemas.b import BResponse,BCreate,BUpdate
from schemas.e import EResponse,EUpdate,ECreate
from schemas.d import DResponse,DUpdate,DCreate
from fastapi.encoders import jsonable_encoder
from sqlalchemy.sql import text
from json import dumps, loads
from datetime import datetime, timedelta
from copy import deepcopy
from sqlalchemy import case, func,extract
from schemas.role import RoleCreate,RoleResponse,RoleUpdate

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

# def get_all_status(db: Session):
#     return db.query(Status).all()

def get_status_by_id(db: Session, id: int):
    return db.query(Status).filter(Status.id == id).first()

def get_p_by_id(db: Session, id: int):
    return db.query(P).filter(P.id == id).first()

def get_B_by_id(db: Session, id: int):
    return db.query(B).filter(B.id == id).first()

def get_E_by_id(db: Session, id: int):
    return db.query(E).filter(E.id == id).first()

def get_D_by_id(db: Session, id: int):
    return db.query(D).filter(D.id == id).first()


def get_proj_by_id(db: Session, id: int):
    return db.query(Proj).filter(P.id == id).first()



def get_all_who(db: Session, response_model=list[WhoResponse]):
    db_who = db.query(Who).order_by(Who.id.desc()).all()
    return jsonable_encoder(db_who)


def get_action(db: Session):
    db_action = db.query(Action).order_by(Action.id.desc()).all()
    print("Fetched actions:", db_action)
    return jsonable_encoder(db_action)


def get_all_role(db: Session, response_model=list[RoleResponse]):
    db_p = db.query(Role).order_by(Role.id.desc()).all()
    return jsonable_encoder(db_p)

def get_role_by_id(db: Session, id: int):
    return db.query(Role).filter(Role.id == id).first()


# def get_mst_now():
#     # Get current UTC time
#     utc_now = datetime.utcnow().replace(tzinfo=ZoneInfo("UTC"))
#     print(f"UTC Time: {utc_now}")  # Debugging: Check UTC time

#     # Convert UTC to MST (America/Denver)
#     mst = ZoneInfo("America/Denver")  
#     mst_time = utc_now.astimezone(mst)

#     print(f"MST Time: {mst_time}")  
#     return mst_time
def get_mst_now():
    """Return current time in MST (Mountain Standard Time)."""
    utc_now = datetime.utcnow().replace(tzinfo=ZoneInfo("UTC"))
    print(f"UTC Time: {utc_now}")
    mst_time = utc_now.astimezone(ZoneInfo("America/Denver"))
    print(f"MST Time: {mst_time}")
    return mst_time

def convert_to_mst(dt: datetime) -> datetime:
    """Convert any datetime (aware or naive) to MST."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))  # Assume UTC if naive
    mst_time = dt.astimezone(ZoneInfo("America/Denver"))
    print(f"Converted to MST: {mst_time}")
    return mst_time


def create_goal(db: Session, goal: Goals):
    from sqlalchemy import text
    date = get_mst_now()  # Already in MST
    currentdate = convert_to_mst(date)
    coverted_date = convert_to_mst(date)

    now = get_mst_now()
    current_year = now.strftime("%y")
    current_week = now.isocalendar()[1]
    base_prefix = f"{current_year}{current_week:02d}"

    result = db.execute(
        text(f"SELECT MAX(goalid) FROM goals WHERE goalid::TEXT LIKE '{base_prefix}%'")
    ).fetchone()
    db.execute(text("SET TIME ZONE 'America/Denver'"))


    max_goalid = result[0] if result and result[0] is not None else None
    if max_goalid and str(max_goalid).startswith(base_prefix):
        suffix_str = str(max_goalid)[4:]
        suffix = int(suffix_str) + 1 if suffix_str.isdigit() else 1
    else:
        suffix = 1
    new_goalid = int(f"{base_prefix}{str(suffix).zfill(4)}")  # Always 4 digits padded
    db_goal = Goals(
        goalid=new_goalid,
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
        isconfidential=goal.isconfidential,
        createddatetime=coverted_date,
        updateddatetime=coverted_date,
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
    )
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

def create_proj(db: Session, proj_data: ProjCreate):
    db_proj = Proj(**proj_data.dict())
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj

def update_proj(db: Session, id: int, proj_data: ProjUpdate):
    db_proj = db.query(Proj).filter(Proj.id == id).first()
    if not db_proj:
        return None
    for key, value in proj_data.dict(exclude_unset=True).items():
        setattr(db_proj, key, value)
    db.commit()
    db.refresh(db_proj)
    return db_proj

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


def create_role(db: Session, role_data: RoleCreate):
    db_role = Role(**role_data.dict())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def update_role(db: Session, id: int, role_data: RoleUpdate):
    db_role = db.query(Role).filter(Role.id == id).first()
    if not db_role:
        return None
    for key, value in role_data.dict(exclude_unset=True).items():
        setattr(db_role, key, value)
    db.commit()
    db.refresh(db_role)
    return db_role

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
    if goal_update.isconfidential is not None:
        db_goal.isconfidential = goal_update.isconfidential

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
    base_query = db.query(Goals)

    if vp:
        base_query = base_query.filter(Goals.vp == vp)
    if proj:
        base_query = base_query.filter(Goals.proj == proj)
    if priority:
        base_query = base_query.filter(Goals.p == priority)
    if created_from:
        base_query = base_query.filter(Goals.createddatetime >= created_from)
    if created_to:
        base_query = base_query.filter(Goals.createddatetime <= created_to)

    # 1. Completed and Delinquent Counts
    completed_delinquent_data = {"Completed": 0, "Delinquent": 0}
    for row in base_query.with_entities(Goals.s, func.count().label("count")).filter(Goals.s.in_(['C', 'D'])).group_by(Goals.s).all():
        if row.s == 'C':
            completed_delinquent_data["Completed"] = row.count
        elif row.s == 'D':
            completed_delinquent_data["Delinquent"] = row.count

    # 2. Valid Projects
    valid_projects = set(proj_row.proj for proj_row in db.query(Proj.proj).all())

    # 3. Project-wise Totals
    raw_project_data = base_query.with_entities(
        Goals.proj,
        func.count().label("total"),
        func.sum(case((Goals.s == 'C', 1), else_=0)).label("completed"),
        func.sum(case((Goals.s == 'D', 1), else_=0)).label("delinquent")
    ).group_by(Goals.proj).all()

    project_data = []
    unassigned = {"project": "Unassigned", "total": 0, "completed": 0, "delinquent": 0}
    for row in raw_project_data:
        proj_value = row.proj or ""
        if proj_value in valid_projects:
            project_data.append({
                "project": proj_value,
                "total": row.total,
                "completed": row.completed,
                "delinquent": row.delinquent
            })
        else:
            unassigned["total"] += row.total
            unassigned["completed"] += row.completed
            unassigned["delinquent"] += row.delinquent
    if unassigned["total"] > 0:
        project_data.append(unassigned)

    # 4. Year-wise Goals
    yearwise_data = base_query.with_entities(
        Goals.fiscalyear,
        func.count().label('count')
    ).group_by(Goals.fiscalyear).order_by(Goals.fiscalyear).all()

    # 5. Status-wise Goals
    statuswise_data = base_query.with_entities(
        Goals.s,
        func.count().label('count')
    ).group_by(Goals.s).all()

    return {
        "completedAndDelinquent": completed_delinquent_data,
        "projectWise": project_data,
        "yearWise": [{"year": row.fiscalyear, "count": row.count} for row in yearwise_data],
        "statusWise": [{"status": row.s or "Unassigned", "count": row.count} for row in statuswise_data]
    }


def create_b(db: Session, b_data: BCreate):
    db_b = B(**b_data.dict())
    db.add(db_b)
    db.commit()
    db.refresh(db_b)
    return db_b

def update_b(db: Session, id: int, b_data: BUpdate):
    db_b = db.query(B).filter(B.id == id).first()
    if not db_b:
        return None
    for key, value in b_data.dict(exclude_unset=True).items():
        setattr(db_b, key, value)
    db.commit()
    db.refresh(db_b)
    return db_b


def update_status(db: Session, id: int, status_data: StatusUpdate):
    db_status = db.query(Status).filter(Status.id == id).first()
    if not db_status:
        return None
    for key, value in status_data.dict(exclude_unset=True).items():
        setattr(db_status, key, value)
    db.commit()
    db.refresh(db_status)
    return db_status


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


def create_D(db: Session, d_data: DCreate):
    db_d = D(**d_data.dict())
    db.add(db_d)
    db.commit()
    db.refresh(db_d)
    return db_d


def update_d(db: Session, id: int, d_data: DUpdate):
    db_d = db.query(D).filter(D.id == id).first()
    if not db_d:
        return None
    for key, value in d_data.dict(exclude_unset=True).items():
        setattr(db_d, key, value)
    db.commit()
    db.refresh(db_d)
    return db_d


HIGHLIGHT_COLORS = [
    'rgb(002, 081, 150)',
    'rgb(081, 040, 136)',
    'rgb(041, 094, 017)',
    'rgb(235, 097, 035)',
    'rgb(064, 176, 166)',
    'rgb(255, 190, 106)',
    'rgb(191, 044, 035)',
    'rgb(253, 179, 056)',
    'rgb(219, 076, 119)',
    'rgb(120, 120, 120)'
]


def highlight_word_diff(old_text: str, new_text: str) -> str:
    import difflib
    old_words = old_text.split()
    new_words = new_text.split()
    sm = difflib.SequenceMatcher(None, old_words, new_words)

    highlighted = []
    color_index = 0

    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            highlighted.extend(new_words[j1:j2])
        elif tag in ('replace', 'insert'):
            for word in new_words[j1:j2]:
                color = HIGHLIGHT_COLORS[color_index % len(HIGHLIGHT_COLORS)]
                highlighted.append(f'<span style="color:{color}; font-weight:bold;">{word}</span>')
                color_index += 1
    return ' '.join(highlighted)

def get_latest_goal_diff_by_goalid(db: Session, goalid: int) -> Dict:
    entries = db.query(goalshistory).filter(goalshistory.goalid == goalid).order_by(goalshistory.createddate).all()
    if not entries:
        return {}

    first_entry = entries[0]
    latest_entry = entries[-1] 

    current_text = f"{latest_entry.action or ''} {latest_entry.description or ''} {latest_entry.memo or ''}".strip()
    original_text = f"{first_entry.action or ''} {first_entry.description or ''} {first_entry.memo or ''}".strip()

    if original_text:
        highlighted = highlight_word_diff(original_text, current_text)
    else:
        highlighted = current_text

    return {
        "id": latest_entry.id,
        "goalid": latest_entry.goalid,
        "createddate": latest_entry.createddate,
        "combined_diff": highlighted
    }

def bind_diffs_to_goals(db: Session, goals: List[Dict]) -> List[Dict]:
    for goal in goals:
        goalid = goal.get("goalid")
        diff_result = get_latest_goal_diff_by_goalid(db, goalid)
        goal["description_diff"] = diff_result
    return goals