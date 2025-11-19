from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import database, models, auth

router = APIRouter(
    prefix="/scores",
    tags=["scores"]
)


@router.post("/")
def create_score(score: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # current_user is already verified
    new_score = models.Score(user_id=current_user.id, score=score)
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    return {"message": "Score added", "score": new_score.score}
