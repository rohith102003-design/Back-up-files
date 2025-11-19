from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base,sessionmaker

DATA_BASE_URL="sqlite:///./tetris.db"
engine=create_engine(DATA_BASE_URL,connect_args={"check_same_thread": False})

Sessionlocal=sessionmaker(autocommit=False,autoflush=False,bind=engine)

Base=declarative_base()

