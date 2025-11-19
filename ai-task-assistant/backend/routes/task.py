from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from session import get_db
from typing import List
from routes.auth import get_current_user
from models import User

from crud import (
    create_task,
    get_tasks,
    get_task_by_id,
    update_task as crud_update_task,
    delete_task as crud_delete_task
)

from schemas import TaskCreate, TaskResponse


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

@router.get("/", response_model=List[TaskResponse])
def get_all_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = get_tasks(db, current_user.id)
    return tasks


@router.post("/", response_model=TaskResponse)
def create_task_route(task: TaskCreate,
                      db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    new_task = create_task(db=db, task=task, user_id=current_user.id)
    return new_task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int,
             db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    
    task = get_task_by_id(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task_route(task_id: int, 
                      updated_task: TaskCreate,
                      db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):

    task = crud_update_task(db, task_id, updated_task, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or not yours")
    return task


@router.delete("/{task_id}")
def delete_task_route(task_id: int,
                      db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):

    deleted = crud_delete_task(db, task_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found or not yours")
    
    return {"msg": "Task deleted successfully"}
