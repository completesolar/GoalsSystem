import difflib
from pprint import pprint
from sqlite3 import IntegrityError
import string
from typing import Dict, List, Optional
from zoneinfo import ZoneInfo
from fastapi import HTTPException
import pytz
from sqlalchemy.orm import Session
from dateutil import tz

# from schemas.schema import Goals
from models.models import Goals, Who, Proj, VP, Status, goalshistory, P, B, E, D, Action,Role,RoleMaster
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
from sqlalchemy import any_, case, func,extract
from schemas.role import RoleCreate,RoleResponse,RoleUpdate
from schemas.roleMaster import RoleMasterCreate,RoleMasterUpdate,RoleMasterResponse

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

# def get_all_goals(db: Session, who_initial: Optional[str] = None):
#     query = db.query(Goals)

#     if who_initial:
#         query = query.filter(Goals.who == who_initial)
#     db_goals = query.order_by(Goals.goalid.desc()).all()
#     return jsonable_encoder(db_goals)


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

def get_goals_metrics(db: Session):
    # Base query without any filters
    base_query = db.query(Goals)

    # 1. Completed and Delinquent Counts
    completed_delinquent_data = {"Completed": 0, "Delinquent": 0}
    for row in base_query.with_entities(Goals.s, func.count().label("count")).filter(
        Goals.s.in_(['C', 'D'])
    ).group_by(Goals.s).all():
        if row.s == 'C':
            completed_delinquent_data["Completed"] = row.count
        elif row.s == 'D':
            completed_delinquent_data["Delinquent"] = row.count

    # 2. Valid Projects
    valid_projects = set(proj_row.proj for proj_row in db.query(Proj.proj).all())

    # 3. Project-wise by all statuses
    status_list = ['C', 'CD', 'K', 'N', 'ND', 'R']

    raw_project_status_data = base_query.with_entities(
        Goals.proj,
        Goals.s,
        func.count().label("count")
    ).group_by(Goals.proj, Goals.s).all()

    project_status_map = {}
    unassigned_key = "Unassigned"

    for row in raw_project_status_data:
        proj = (row.proj or unassigned_key).strip().upper()
        status = row.s
        if proj not in project_status_map:
            project_status_map[proj] = {}
        project_status_map[proj][status] = row.count

    all_projects = sorted(project_status_map.keys())

    project_status_series = []
    for status in status_list:
        project_status_series.append({
            "name": status,
            "data": [project_status_map.get(p, {}).get(status, 0) for p in all_projects]
        })

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

    # 6. VP-wise Goals by Project
    raw_vp_proj_data = base_query.with_entities(
        Goals.vp,
        Goals.proj,
        func.count().label("count")
    ).group_by(Goals.vp, Goals.proj).all()

    vp_proj_map = {}
    unassigned_vp = "Unassigned VP"
    unassigned_proj = "Unassigned"

    for row in raw_vp_proj_data:
        vp = (row.vp or unassigned_vp).strip()
        proj = (row.proj or unassigned_proj).strip().upper()
        if proj not in vp_proj_map:
            vp_proj_map[proj] = {}
        vp_proj_map[proj][vp] = row.count

    all_vps = sorted({vp for proj_data in vp_proj_map.values() for vp in proj_data})
    all_projects = sorted(vp_proj_map.keys())

    vp_proj_series = []
    for proj in all_projects:
        vp_proj_series.append({
            "name": proj,
            "data": [vp_proj_map[proj].get(vp, 0) for vp in all_vps]
        })

    return {
        "completedAndDelinquent": completed_delinquent_data,
        "projectWiseByStatus": {
            "categories": all_projects,
            "series": project_status_series
        },
        "projectsByVP": {
            "categories": all_vps,
            "series": vp_proj_series
        },
        "yearWise": [{"year": row.fiscalyear, "count": row.count} for row in yearwise_data],
        "statusWise": [{"status": (row.s or "Unassigned").strip(), "count": row.count} for row in statuswise_data]
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

def get_all_goal_diffs_by_goalid(db: Session, goalid: int) -> List[Dict]:
    entries = db.query(goalshistory).filter(goalshistory.goalid == goalid).order_by(goalshistory.createddate.desc()).all()
    if not entries:
        return []
    first_entry = entries[-1]
    original_text = f"{first_entry.action or ''} {first_entry.description or ''} {first_entry.memo or ''}".strip()
    diffs = []
    for current_entry in entries:
        current_text = f"{current_entry.action or ''} {current_entry.description or ''} {current_entry.memo or ''}".strip()
        highlighted = highlight_word_diff(original_text, current_text)
        
        diffs.append({
            "id": current_entry.id,
            "goalid": current_entry.goalid,
            "createddate": current_entry.createddate,
            "createdby": current_entry.createdby,
            "who": current_entry.who,
            "p": current_entry.p,
            "proj": current_entry.proj,
            "vp": current_entry.vp,
            "b": current_entry.b,
            "e": current_entry.e,
            "d": current_entry.d,
            "s": current_entry.s,
            "action": current_entry.action,
            "memo": current_entry.memo,
            "fiscalyear": current_entry.fiscalyear,
            "updateBy": current_entry.updateBy,
            "description": current_entry.description,
            "combined_diff": highlighted
        })
    return diffs

def get_all_roleMaster(db: Session, response_model=list[RoleMasterResponse]):
    db_roleMaster = db.query(RoleMaster).order_by(RoleMaster.id.desc()).all()
    return jsonable_encoder(db_roleMaster)

def get_roleMaster_by_id(db: Session, id: int):
    return db.query(RoleMaster).filter(RoleMaster.id == id).first()


# def create_roleMaster(db: Session, roleMaster_data: RoleMasterCreate):
#     print("roleMaster_data",roleMaster_data)
#     db_roleMaster = RoleMaster(**roleMaster_data.dict())
#     db.add(db_roleMaster)
#     db.commit()
#     db.refresh(db_roleMaster)
#     return db_roleMaster

def create_roleMaster(db: Session, roleMaster_data: RoleMasterCreate):
    try:
        created_records: List[RoleMasterResponse] = [] 
        print("roleMaster_data",roleMaster_data)
        for user, user_id, email in zip(roleMaster_data.user, roleMaster_data.user_id, roleMaster_data.user_email):
            existing_role = db.query(RoleMaster).filter(RoleMaster.user == [user]).first()
            if existing_role:
                print(f"User '{user}' already exists!") 
                raise HTTPException(
                    status_code=400,
                    detail=f"{user} already exists"
                )
            
            db_roleMaster = RoleMaster(
                role=roleMaster_data.role,
                user=[user],
                user_id=[user_id], 
                role_id=roleMaster_data.role_id,
                remarks=roleMaster_data.remarks,
                user_email=[email]
            )
            
            db.add(db_roleMaster)
            db.commit() 
            db.refresh(db_roleMaster)  
            created_records.append(RoleMasterResponse(
                id=db_roleMaster.id,
                role=db_roleMaster.role,
                user=[user], 
                user_id=[user_id],  
                role_id=db_roleMaster.role_id,
                remarks=db_roleMaster.remarks,
                user_email=[email]

            ))

        return created_records 

    except IntegrityError as e:
        db.rollback() 
        print(f"Integrity error occurred: {e}")
        raise HTTPException(status_code=400,detail=f"{user} already exists")
    
    except Exception as e:
        db.rollback()  
        print(f"Error occurred while creating RoleMaster: {e}")
        raise HTTPException(status_code=400, detail=f"{user} already exists")
    
def update_roleMaster(db: Session, id: int, role_data: RoleMasterUpdate):
    try:
        db_roleMaster = db.query(RoleMaster).filter(RoleMaster.id == id).first()
        if not db_roleMaster:
            raise HTTPException(status_code=404, detail=f"RoleMaster with ID {id} not found")

        for key, value in role_data.dict(exclude_unset=True).items():
            setattr(db_roleMaster, key, value)

        db.commit()
        db.refresh(db_roleMaster)
        return RoleMasterResponse(
            id=db_roleMaster.id,
            role=db_roleMaster.role,
            user=db_roleMaster.user,
            user_id=db_roleMaster.user_id,
            role_id=db_roleMaster.role_id,
            remarks=db_roleMaster.remarks,
            user_email=db_roleMaster.user_email

        )
    except IntegrityError as e:
        db.rollback()
        print(f"Integrity error occurred: {e}")
        raise HTTPException(status_code=400, detail="Integrity error occurred while updating RoleMaster")
    
    except Exception as e:
        db.rollback()
        print(f"Error occurred while updating RoleMaster: {e}")
        raise HTTPException(status_code=400, detail="An error occurred while updating RoleMaster")
    


def get_email(db: Session, email: str):
    print("=== get_email CALLED ===")
    print(f"Input email: {email}")

    if not email:
        print("No email provided.")
        return None

    email = email.lower()
    print(f"Lowercased email: {email}")

    # 1. Get WHO object
    who = db.query(Who).filter(func.lower(Who.primary_email) == email).first()
    print("WHO object:")
    pprint(who.__dict__ if who else "None")

    # 2. Match email in roleMaster array
    print("Checking for roleMaster with email in user_email array...")
    role_master = db.query(RoleMaster).filter(
        email == any_(RoleMaster.user_email)
    ).first()

    if not role_master:
        print("RoleMaster not found. Returning default access.")
        return {
            "user_email": email,
            "user": "",
            "role": "Default",
            "access": ["Goals"],
            "initial": who.initials if who else ""
        }

    print("RoleMaster found:")
    pprint(role_master.__dict__)

    # 3. Get Role object
    print(f"Fetching Role for role = '{role_master.role}'")
    role = db.query(Role).filter(Role.role == role_master.role).first()

    if not role:
        print("No matching role found in Role table.")
        return None

    print("Role object:")
    pprint(role.__dict__)

    result = {
        "user_email": role_master.user_email,
        "user": role_master.user,
        "role": role_master.role,
        "access": role.access,
        "initial": who.initials if who else ""
    }

    print("Final result to return:")
    pprint(result)
    print("=== get_email END ===\n")
    return result

def get_roleMaster_By_Email(db: Session, email: str):
    print("email", email)
    if not email:
        return None

    # Lowercase the input
    email = email.lower()

    # Do NOT lowercase the array; only use any_() directly
    role_master = db.query(RoleMaster).filter(
        email == any_(RoleMaster.user_email)
    ).first()

    if not role_master:
        print(f"No role_master found for email: {email}")
        return None

    role = db.query(Role).filter(Role.role == role_master.role).first()

    return {
        "user_email": role_master.user_email,
        "access": role.access if role else [],
    }

def get_supervisor_chain(db: Session, user_who: str):
    supervisors = []
    
    # Fetch the current user (the starting 'who')
    current_user = db.query(Who).filter(Who.initials == user_who).first()

    # Check if the user exists
    if not current_user:
        raise HTTPException(status_code=404, detail=f"User with initials {user_who} not found")

    # Save the employee name of the initial user (starting point) for the final response
    starting_employee_name = current_user.employee_name

    print(f"Found user: {current_user.employee_name} (ID: {current_user.id})")  # Debug log

    # Loop to get the supervisor chain using the supervisor's initials
    while current_user and current_user.supervisor_name:
        print(f"Adding supervisor: {current_user.supervisor_name}")  # Debug log
        
        # Fetch the supervisor using their full name (employee_name)
        supervisor = db.query(Who).filter(Who.employee_name == current_user.supervisor_name).first()

        if supervisor:
            # Add the supervisor's initials (not their full name)
            supervisors.append(supervisor.initials)
            # Move up to the next supervisor (using their initials)
            current_user = db.query(Who).filter(Who.initials == supervisor.initials).first()
        else:
            break

        # If the supervisor does not exist or has no supervisor, break out of the loop
        if not current_user or not current_user.supervisor_name:
            print(f"No more supervisors found for {current_user.initials if current_user else 'None'}")  # Debug log
            break

    print(f"Supervisor chain: {supervisors}")  # Debug log

    # Return the supervisor chain with the original employee_name
    return {
        "who": user_who, 
        "employee_name": starting_employee_name,  # Use the starting employee name (KYS's name)
        "supervisor_names": supervisors  # List of supervisor initials
    }

def get_user_initials(db: Session, email: str):
    # Normalize email to lowercase
    email = email.lower()
    
    # Query the 'Who' table for the user by email
    user = db.query(Who).filter(Who.primary_email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail=f"User with email {email} not found")

    return user.initials  # Return the initials of the user