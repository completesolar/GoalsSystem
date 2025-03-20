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
