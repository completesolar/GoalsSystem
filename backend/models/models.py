from sqlalchemy import (
    ARRAY,
    JSON,
    TIMESTAMP,
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    BigInteger,
    Date,
    Boolean,
    Text,
    func,
)
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class B(Base):
    __tablename__ = "b"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    b = Column(Integer, unique=True, index=True)
    status = Column(Integer, default=1)  
    remarks = Column(String, nullable=True)



class E(Base):
    __tablename__ = "e" 
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    e = Column(Integer, unique=True, index=True)
    status = Column(Integer, default=1)  
    remarks = Column(String, nullable=True)



class D(Base):
    __tablename__ = "d"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    d = Column(Integer, unique=True, index=True)
    status = Column(Integer, default=1)  
    remarks = Column(String, nullable=True)



class P(Base):
    __tablename__ = "p"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    p = Column(Integer, unique=True, index=True)
    status = Column(Integer, default=1)  
    remarks = Column(String, nullable=True)

class Goals(Base):
    __tablename__ = "goals"

    goalid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    who = Column(String, unique=False, index=True)
    p = Column(Integer, unique=False, index=True)
    proj = Column(String)
    vp = Column(String)
    b = Column(Integer)
    e = Column(String)
    d = Column(String)
    s = Column(String)
    action = Column(String)  # renamed from gdb
    memo = Column(String)    # new field
    description = Column(String)  # Allows long text descriptions
    fiscalyear = Column(Integer)
    updateBy = Column(String)
    createddatetime = Column(DateTime,)  # Auto-set on insert
    updateddatetime = Column(DateTime)  # Auto-update on row update
    isconfidential = Column(Boolean, default=False)

class Status(Base):
    __tablename__ = 'status'
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    remarks = Column(String, nullable=True)
    active_status = Column(Integer)


class Who(Base):
    __tablename__ = "who"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(BigInteger, nullable=True)
    employee_name = Column(String(255), nullable=True)
    last_name = Column(String(100), nullable=False)
    first_name = Column(String(100), nullable=False)
    initials = Column(String(10), nullable=True)
    primary_email = Column(String(255), unique=True, nullable=True)
    employee_status = Column(String(50), nullable=True)
    client_hire_date = Column(Date, nullable=True)
    employee_reference_id = Column(BigInteger, nullable=True)
    job_title = Column(String(255), nullable=True)
    employee_level = Column(Integer, nullable=True)
    supervisor_name = Column(String(255), nullable=True)
    is_manager = Column(Boolean, nullable=True)
    manager_level = Column(Integer, nullable=True)
    worksite_state = Column(String(10), nullable=True)
    division = Column(String(100), nullable=True)
    manager_level_1 = Column(String(255), nullable=True)
    manager_level_2 = Column(String(255), nullable=True)
    manager_level_3 = Column(String(255), nullable=True)
    manager_level_4 = Column(String(255), nullable=True)

class Proj(Base):
    __tablename__ = "proj"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proj = Column(String, unique=True, index=True)
    status = Column(Integer, default=1)  
    remarks = Column(String, nullable=True)

class VP(Base):
    __tablename__ = "vp"
    id = Column(Integer, primary_key=True, index=True)
    last_name = Column(String, index=True)
    first_name = Column(String, index=True)
    decoder = Column(String, nullable=True)


class goalshistory(Base):
    __tablename__ = "goalshistory"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    goalid = Column(Integer, ForeignKey("goals.goalid"), index=True)
    createddate = Column(DateTime, default=datetime.utcnow)
    createdby = Column(String, nullable=True)
    who = Column(String, nullable=True)
    p = Column(Integer, nullable=True)
    proj = Column(String, nullable=True)
    vp = Column(String, nullable=True)
    b = Column(Integer, nullable=True)
    e = Column(String, nullable=True)
    d = Column(String, nullable=True)
    s = Column(String, nullable=True)
    action = Column(String, nullable=True)
    memo = Column(String, nullable=True)
    fiscalyear = Column(Integer, nullable=True)
    updateBy = Column(String, nullable=True)
    description = Column(String, nullable=True)
    class Config:
        orm_mode = True
        
    table_goal = relationship("Goals", back_populates="table_history_items")

    Goals.table_history_items = relationship(
        "goalshistory", back_populates="table_goal"
    )


class Action(Base):
    __tablename__ = "action"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    action = Column(String, unique=True, index=True)


class Role(Base):
    __tablename__ = "role"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role = Column(String,nullable=True,unique=True)
    status = Column(Integer, default=1)  
    remarks = Column(String, nullable=True)
    access = Column(JSON)

class RoleMaster(Base):
    __tablename__ = 'roleMaster'
    id = Column(Integer, primary_key=True, autoincrement=True)
    role = Column(String, nullable=True)
    role_id = Column(Integer)
    user = Column(JSON)
    remarks = Column(String, nullable=True)


class GlobalSettings(Base):
    __tablename__ = "global_settings"

    key_name = Column(String, primary_key=True)
    value = Column(Boolean)
    updated_at = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp())
    updated_by = Column(String)