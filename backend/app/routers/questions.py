from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/questions", tags=["questions"])


def _get_question_or_404(db: Session, question_id: int) -> models.Question:
    question = db.get(models.Question, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="問題が見つかりません")
    return question


@router.get("/{question_id}", response_model=schemas.QuestionOut)
def get_question(question_id: int, db: Session = Depends(get_db)):
    return _get_question_or_404(db, question_id)


@router.put("/{question_id}", response_model=schemas.QuestionOut)
def update_question(
    question_id: int, payload: schemas.QuestionUpdate, db: Session = Depends(get_db)
):
    question = _get_question_or_404(db, question_id)
    for field, value in payload.model_dump().items():
        setattr(question, field, value)
    db.commit()
    db.refresh(question)
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db)):
    question = _get_question_or_404(db, question_id)
    db.delete(question)
    db.commit()
