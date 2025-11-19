from database import Base,engine

Base.metadata.create_all(bind=engine)

print("database table created successfully")
