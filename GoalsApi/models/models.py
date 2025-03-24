from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Goals(Base):
    __tablename__ = "goals"

    goalid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    who = Column(String, unique=False, index=True)
    p = Column(Integer, unique=False, index=True)
    proj = Column(String)
    vp = Column(String)
    b = Column(Integer)
    e = Column(Integer)
    d = Column(Integer)
    s = Column(String)
    gdb = Column(String)
    fiscalyear = Column(Integer)
    updateBy = Column(String)

class Who(Base):
    __tablename__ = "who"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    who = Column(String, unique=True, index=True)

class Proj(Base):
    __tablename__ = "proj"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proj = Column(String, unique=True, index=True)

class Vp(Base):
    __tablename__ = "vp"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vp = Column(String, unique=True, index=True)

class Status(Base):
    __tablename__ = "status"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    status = Column(String, unique=True, index=True)