from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskBase(BaseModel):
    title:str
    description:Optional[str]=None
    status:str
    priority:str

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id:int
    created_at:datetime
    updated_at:datetime

    class Config:
        orm_mode=True
