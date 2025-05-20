from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.orm import Session
from schemas.schema import Goals, GoalsResponse, GoalsUpdate
from schemas.goalshistory import goalshistory, goalhistoryResponse
from schemas.who import SupervisorChainResponse, WhoCreate, WhoResponse
from schemas.status import StatusCreate, StatusUpdate, StatusResponse
from schemas.proj import ProjResponse,ProjUpdate,ProjCreate
from schemas.vp import VPResponse
from schemas.p import PCreate, PResponse, PUpdate
from schemas.role import RoleUpdate,RoleResponse,RoleCreate
from schemas.b import BResponse,BCreate,BUpdate
from schemas.e import EResponse,ECreate,EUpdate
from schemas.d import DResponse,DUpdate,DCreate
from schemas.action import ActionResponse
from typing import List, Optional
from database import get_db
from schemas.roleMaster import RoleMasterCreate,RoleMasterUpdate,RoleMasterResponse
from crud import (
    bind_diffs_to_goals,
    create_goal,
    get_all_goal_diffs_by_goalid,
    get_direct_reports,
    get_goals_by_id,
    get_all_goals,
    get_latest_goal_diff_by_goalid,
    get_supervisor_chain,
    get_user_initials,
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
    update_d,
    get_B_by_id,
    get_E_by_id,
    get_D_by_id,
    update_status,
    get_p_by_id,
    get_proj_by_id,
    create_proj,
    update_proj,
    get_all_role,
    get_role_by_id,
    create_role,
    update_role,
    get_all_roleMaster,
    get_roleMaster_by_id,
    create_roleMaster,
    update_roleMaster,
    get_email,
    get_roleMaster_By_Email
)
from typing import Annotated

router = APIRouter()




@router.get("/api/vp", response_model=list[VPResponse])
def read_vp(db: Session = Depends(get_db)):
    return get_all_vp(db)

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
# @router.get("/api/goals/{who_initial}", response_model=list[GoalsResponse])
# def read_goals(who_initial: str, db: Session = Depends(get_db)):
#     return get_all_goals(db, who_initial)



@router.get("/api/goalshistory/{goalid}", response_model=list[goalhistoryResponse])
async def get_goalshistory(goalid: int, db: Session = Depends(get_db)):
    records = get_goalshistory_by_id(db, goalid=goalid)
    return [goalhistoryResponse.model_validate(record).model_dump() for record in records]

@router.get("/api/goals/metrics")
def read_goals_metrics(
    db: Session = Depends(get_db)
):
    return get_goals_metrics(
    db=db
    )

@router.get("/api/goals/{goalid}", response_model=GoalsResponse)
def read_goal(goalid: int, db: Session = Depends(get_db)):
    db_goal = get_goals_by_id(db, goalid=goalid)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal

@router.put("/api/goals/{goalid}")
def update_goals(goalid: int, goal_update: GoalsUpdate, db: Session = Depends(get_db)):
    updated_goal = update_goal(db=db, goal_id=goalid, goal_update=goal_update)
    diff = get_latest_goal_diff_by_goalid(db, goalid)
    
    # Attach the diff to the response
    response = updated_goal.__dict__ if not isinstance(updated_goal, dict) else updated_goal
    response["description_diff"] = diff
    return response



@router.get("/api/goalshistory", response_model=list[goalhistoryResponse])
def read_goals_history(db: Session = Depends(get_db)):
    return get_all_goals_history(db)

@router.get("/api/action", response_model=list[ActionResponse])
def read_action(db: Session = Depends(get_db)):
    return get_action(db)

# p
@router.get("/api/p", response_model=list[PResponse])
def read_p(db: Session = Depends(get_db)):
    return get_all_p(db)

@router.get("/api/p/{id}", response_model=PResponse)
def read_p(id: int, db: Session = Depends(get_db)):
    db_p = get_p_by_id(db, id=id)
    if db_p is None:
        raise HTTPException(status_code=404, detail="Status not found")
    return db_p

# @router.post("/api/p", response_model=PResponse)
# def create_p_endpoint(p: PCreate, db: Session = Depends(get_db)):
#     return create_p(db=db, p_data=p)

@router.post("/api/p", response_model=PResponse)
def create_p_endpoint(p: PCreate, db: Session = Depends(get_db)):
    try:
        return create_p(db=db, p_data=p)
    except IntegrityError as e:
        db.rollback() 
        if 'duplicate key value violates unique constraint' in str(e):
            raise HTTPException(status_code=400, detail="Duplicate data: this entry already exists.")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    
    
@router.put("/api/p/{id}", response_model=PResponse)
def update_p_endpoint(id: int, p: PUpdate, db: Session = Depends(get_db)):
    print("status type:",p) 
    db_p = update_p(db=db, id=id, p_data=p)
    if not db_p:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_p

# status
@router.get("/api/status", response_model=list[StatusResponse])
def read_status(db: Session = Depends(get_db)):
    return get_all_status(db)

# @router.post("/api/status", response_model=StatusResponse)
# def create_status(status: StatusCreate, db: Session = Depends(get_db)):
#     return create_status_entry(db=db, status=status)

@router.post("/api/status", response_model=StatusResponse)
def create_status(status: StatusCreate, db: Session = Depends(get_db)):
    try:
        return create_status_entry(db=db, status=status)
    except IntegrityError as e:
        db.rollback()
        if 'duplicate key value violates unique constraint' in str(e):
            raise HTTPException(status_code=400, detail="Duplicate data")
        raise HTTPException(status_code=500, detail="Internal server error")

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

# @router.post("/api/b", response_model=BResponse)
# def create_B(b: BCreate, db: Session = Depends(get_db)):
#     return create_b(db=db, b_data=b)

@router.post("/api/b", response_model=BResponse)
def create_B(b: BCreate, db: Session = Depends(get_db)):
    try:
        return create_b(db=db, b_data=b)
    except IntegrityError as e:
        db.rollback()
        if 'duplicate key value violates unique constraint' in str(e):
            raise HTTPException(status_code=400, detail="Duplicate data")
        raise HTTPException(status_code=500, detail="Internal server error")
    
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

# @router.post("/api/e", response_model=EResponse)
# def create_e_endpoint(e: ECreate, db: Session = Depends(get_db)):
#     return create_E(db=db, e_data=e)

@router.post("/api/e", response_model=EResponse)
def create_e_endpoint(e: ECreate, db: Session = Depends(get_db)):
    try:
        return create_E(db=db, e_data=e)
    except IntegrityError as ex:
        db.rollback()
        if 'duplicate key value violates unique constraint' in str(ex):
            raise HTTPException(status_code=400, detail="Duplicate data")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/api/e/{id}", response_model=EResponse)
def read_(id: int, db: Session = Depends(get_db)):
    db_e = get_E_by_id(db, id=id)
    if db_e is None:
        raise HTTPException(b_code=404, detail="B not found")
    return db_e

@router.put("/api/e/{id}", response_model=EResponse)
def update_e_endpoint(id: int, e: PUpdate, db: Session = Depends(get_db)):
    db_e = update_E(db=db, id=id, e_data=e)
    if not db_e:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_e

# D
@router.get("/api/d", response_model=list[DResponse])
def read_d(db: Session = Depends(get_db)):
    return get_all_d(db)

# @router.post("/api/d", response_model=DResponse)
# def create_d(D: DCreate, db: Session = Depends(get_db)):
#     return create_D(db=db, d_data=D)
@router.post("/api/d", response_model=DResponse)
def create_d(D: DCreate, db: Session = Depends(get_db)):
    try:
        return create_D(db=db, d_data=D)
    except IntegrityError as ex:
        db.rollback()
        if 'duplicate key value violates unique constraint' in str(ex):
            raise HTTPException(status_code=400, detail="Duplicate data")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/api/d/{id}", response_model=DResponse)
def read_D(id: int, db: Session = Depends(get_db)):
    db_D = get_D_by_id(db, id=id)
    if db_D is None:
        raise HTTPException(D_code=404, detail="D not found")
    return db_D

@router.put("/api/d/{id}", response_model=DResponse)
def update_D_endpoint(id: int, d: DUpdate, db: Session = Depends(get_db)):
    db_d = update_d(db=db, id=id, d_data=d)
    if not db_d:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_d
 

#  proj
@router.get("/api/proj", response_model=list[ProjResponse])
def read_proj(db: Session = Depends(get_db)):
    return get_all_proj(db)

@router.get("/api/proj/{id}", response_model=ProjResponse)
def read_proj(id: int, db: Session = Depends(get_db)):
    db_proj = get_proj_by_id(db, id=id)
    if db_proj is None:
        raise HTTPException(status_code=404, detail="Status not found")
    return db_proj


@router.post("/api/proj", response_model=ProjResponse)
def create_proj_endpoint(proj: ProjCreate, db: Session = Depends(get_db)):
    try:
        return create_proj(db=db, proj_data=proj)
    except IntegrityError as e:
        db.rollback() 
        if 'duplicate key value violates unique constraint' in str(e):
            raise HTTPException(status_code=400, detail="Duplicate data: this entry already exists.")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    
    
@router.put("/api/proj/{id}", response_model=ProjResponse)
def update_proj_endpoint(id: int, proj: ProjUpdate, db: Session = Depends(get_db)):
    db_proj = update_proj(db=db, id=id, proj_data=proj)
    if not db_proj:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_proj

# role
@router.get("/api/role", response_model=list[RoleResponse])
def read_role(db: Session = Depends(get_db)):
    return get_all_role(db)

@router.get("/api/role/{id}", response_model=RoleResponse)
def read_role(id: int, db: Session = Depends(get_db)):
    db_role = get_role_by_id(db, id=id)
    if db_role is None:
        raise HTTPException(status_code=404, detail="role not found")
    return db_role


@router.post("/api/role", response_model=RoleResponse)
def create_role_endpoint(role: RoleCreate, db: Session = Depends(get_db)):
    try:
        return create_role(db=db, role_data=role)
    except IntegrityError as e:
        db.rollback() 
        if 'duplicate key value violates unique constraint' in str(e):
            raise HTTPException(status_code=400, detail="Duplicate data: this entry already exists.")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    
@router.put("/api/role/{id}", response_model=RoleResponse)
def update_role_endpoint(id: int, role: RoleUpdate, db: Session = Depends(get_db)):
    db_role = update_role(db=db, id=id, role_data=role)
    if not db_role:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_role


# role master
@router.get("/api/roleMaster", response_model=list[RoleMasterResponse])
def read_role(db: Session = Depends(get_db)):
    return get_all_roleMaster(db)

@router.get("/api/roleMaster/{id}", response_model=RoleMasterResponse)
def read_role(id: int, db: Session = Depends(get_db)):
    db_roleMaster = get_roleMaster_by_id(db, id=id)
    if db_roleMaster is None:
        raise HTTPException(status_code=404, detail="role not found")
    return db_roleMaster


# @router.post("/api/roleMaster", response_model=List[RoleMasterResponse])
# def create_roleMaster_endpoint(role: RoleMasterCreate, db: Session = Depends(get_db)):
#         return create_roleMaster(db=db, roleMaster_data=role)
@router.post("/api/roleMaster", response_model=List[RoleMasterResponse])
def create_roleMaster_endpoint(role: RoleMasterCreate, db: Session = Depends(get_db)):
    created_role = create_roleMaster(db=db, roleMaster_data=role)
    return [created_role] 
@router.put("/api/roleMaster/{id}", response_model=RoleMasterResponse)
def update_role_endpoint(id: int, role: RoleMasterUpdate, db: Session = Depends(get_db)):
    db_roleMaster = update_roleMaster(db=db, id=id, role_data=role)
    if not db_roleMaster:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_roleMaster

@router.get("/api/loginCheck/{email}")
def read_loginCred(email: str, db: Session = Depends(get_db)):
    result = get_email(db, email)
    if not result:
        raise HTTPException(status_code=404, detail="Email not found or role not assigned")
    return result

@router.get("/api/roleMasterByEmail/{email}")
def read_RoleMaster_By_Id(email: str, db: Session = Depends(get_db)):
    print("email",email)
    result = get_roleMaster_By_Email(db, email)
    if not result:
        result=[]
    return result

@router.get("/api/who-initials/{email}")
def get_who_and_vp_by_email(email: str, db: Session = Depends(get_db)):
    print(f"🔍 Incoming email for WHO/VP lookup: {email}")
    
    result = db.execute(
        text("""
            SELECT w.initials AS who,
                   sv.initials AS vp
            FROM public.who w
            LEFT JOIN public.who sv ON w.supervisor_name = sv.employee_name
            WHERE LOWER(w.primary_email) = LOWER(:email)
        """),
        {"email": email}
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="User not found or supervisor not mapped")

    return {"who": result[0], "vp": result[1]}

@router.get("/api/supervisor-chain/{who}", response_model=SupervisorChainResponse)
def get_supervisor_chain_endpoint(who: str, db: Session = Depends(get_db)):
    # Get the supervisor chain for the user
    supervisor_chain = get_supervisor_chain(db, who)
    return supervisor_chain

@router.get("/api/who-initials/{email}")
async def get_user_initials_endpoint(email: str, db: Session = Depends(get_db)):
    # Fetch the initials using the function
    initials = get_user_initials(db, email)
    return {"who": initials}

@router.get("/api/direct-reports/{supervisor_initials}")
async def get_direct_reports_endpoint(supervisor_initials: str, db: Session = Depends(get_db)):
    # Fetch direct reports (subordinates) where the supervisor_name matches the given initials
    direct_reports = get_direct_reports(db, supervisor_initials)
    return direct_reports