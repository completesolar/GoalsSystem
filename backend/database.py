from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:Excel.123@127.0.0.1/retail_db'
# SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:jQ78tjx+:P2o@goals-dev.csfuxz3a9n5z.us-west-2.rds.amazonaws.com/goals-dev'
SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:jQ78tjx+:P2o@goals-dev.csfuxz3a9n5z.us-west-2.rds.amazonaws.com/goals-dev'

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()