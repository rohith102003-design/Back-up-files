from sqlalchemy.orm import Session
from models import Tasks
from schemas import TaskCreate


def create_task(db: Session, task: TaskCreate, user_id: int):
    new_task = Tasks(
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        user_id=user_id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


def get_tasks(db: Session, user_id: int):
    return db.query(Tasks).filter(Tasks.user_id == user_id).all()


def get_task_by_id(db: Session, task_id: int, user_id: int):
    return db.query(Tasks).filter(Tasks.id == task_id, Tasks.user_id == user_id).first()


def update_task(db: Session, task_id: int, updated_task: TaskCreate, user_id: int):
    task = db.query(Tasks).filter(Tasks.id == task_id, Tasks.user_id == user_id).first()

    if not task:
        return None

    task.title = updated_task.title
    task.description = updated_task.description
    task.status = updated_task.status
    task.priority = updated_task.priority

    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int, user_id: int):
    task = db.query(Tasks).filter(Tasks.id == task_id, Tasks.user_id == user_id).first()

    if not task:
        return None

    db.delete(task)
    db.commit()
    return task
