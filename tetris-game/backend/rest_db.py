from database import Base, engine
from models import User

# WARNING: This will delete all existing tables and data
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("Database reset and tables recreated.")
