from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from . import models, schemas, database, auth

router = APIRouter(prefix="/scores", tags=["Scores"])

def get_current_user(token: str, db: Session):
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return db.query(models.User).filter(models.User.username == username).first()
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/", response_model=schemas.ScoreOut)
def create_score(
    score: schemas.ScoreCreate,
    token: str,
    db: Session = Depends(database.get_db)
):
    user = get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    new_score = models.Score(value=score.value, user_id=user.id)
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    return new_score

@router.get("/", response_model=list[schemas.ScoreOut])
def get_scores(db: Session = Depends(database.get_db)):
    return db.query(models.Score).order_by(models.Score.value.desc()).limit(10).all()
