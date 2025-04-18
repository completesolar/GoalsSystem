from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class B(Base):
    __tablename__ = "b"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    b = Column(Integer, unique=True, index=True)


class E(Base):
    __tablename__ = "e"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    e = Column(Integer, unique=True, index=True)


class D(Base):
    __tablename__ = "d"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    d = Column(Integer, unique=True, index=True)


class P(Base):
    __tablename__ = "p"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    p = Column(Integer, unique=True, index=True)


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
    gdb = Column(String)
    fiscalyear = Column(Integer)
    updateBy = Column(String)
    createddatetime = Column(DateTime, default=func.now())  # Auto-set on insert
    updateddatetime = Column(
        DateTime, default=func.now(), onupdate=func.now()
    )  # Auto-update on row update
    description = Column(Text, nullable=True)


class Status(Base):
    __tablename__ = "status"
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)


class Who(Base):
    __tablename__ = "who"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slno = Column(Integer, nullable=False)
    ee_id = Column(Integer, unique=True, nullable=False)
    last_name = Column(String(255), nullable=False)
    first_name = Column(String(255), nullable=False)
    middle_name = Column(String(255), nullable=True)
    decoder = Column(String(50), nullable=True)
    mobile = Column(String(20), nullable=True)
    work_email = Column(String(255), unique=True, nullable=True)
    title = Column(String(255), nullable=True)


class Proj(Base):
    __tablename__ = "proj"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proj = Column(String, unique=True, index=True)


class VP(Base):
    __tablename__ = "vp"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vp = Column(String, unique=True, index=True)


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
    gdb = Column(String, nullable=True)
    fiscalyear = Column(Integer, nullable=True)
    updateBy = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    class Config:
        orm_mode = True

    table_goal = relationship("Goals", back_populates="table_history_items")

    Goals.table_history_items = relationship(
        "goalshistory", back_populates="table_goal"
    )
