from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/quiz-sets", tags=["quiz-sets"])


def _count_questions(db: Session, quiz_set_id: int) -> int:
    return (
        db.query(func.count(models.Question.id))
        .filter(models.Question.quiz_set_id == quiz_set_id)
        .scalar()
    )


def _get_quiz_set_or_404(db: Session, quiz_set_id: int) -> models.QuizSet:
    quiz_set = db.get(models.QuizSet, quiz_set_id)
    if quiz_set is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="問題集が見つかりません")
    return quiz_set


@router.get("", response_model=list[schemas.QuizSetOut])
def list_quiz_sets(db: Session = Depends(get_db)):
    quiz_sets = db.query(models.QuizSet).order_by(models.QuizSet.created_at.desc()).all()
    return [
        schemas.QuizSetOut(
            id=quiz_set.id,
            name=quiz_set.name,
            question_count=_count_questions(db, quiz_set.id),
            # クイズセッション機能はまだ実装していないため、直近正答率は常にNone(未挑戦扱い)
            latest_accuracy=None,
        )
        for quiz_set in quiz_sets
    ]


@router.post("", response_model=schemas.QuizSetOut, status_code=status.HTTP_201_CREATED)
def create_quiz_set(payload: schemas.QuizSetCreate, db: Session = Depends(get_db)):
    quiz_set = models.QuizSet(name=payload.name)
    db.add(quiz_set)
    db.commit()
    db.refresh(quiz_set)
    return schemas.QuizSetOut(id=quiz_set.id, name=quiz_set.name, question_count=0, latest_accuracy=None)


@router.get("/{quiz_set_id}", response_model=schemas.QuizSetDetailOut)
def get_quiz_set(quiz_set_id: int, db: Session = Depends(get_db)):
    quiz_set = _get_quiz_set_or_404(db, quiz_set_id)
    return schemas.QuizSetDetailOut(id=quiz_set.id, name=quiz_set.name, questions=[])


@router.put("/{quiz_set_id}", response_model=schemas.QuizSetOut)
def update_quiz_set(quiz_set_id: int, payload: schemas.QuizSetUpdate, db: Session = Depends(get_db)):
    quiz_set = _get_quiz_set_or_404(db, quiz_set_id)
    quiz_set.name = payload.name
    db.commit()
    db.refresh(quiz_set)
    return schemas.QuizSetOut(
        id=quiz_set.id,
        name=quiz_set.name,
        question_count=_count_questions(db, quiz_set.id),
        latest_accuracy=None,
    )


@router.delete("/{quiz_set_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz_set(quiz_set_id: int, db: Session = Depends(get_db)):
    quiz_set = _get_quiz_set_or_404(db, quiz_set_id)
    # ON DELETE CASCADEで問題・学習履歴も連動して削除される(db-design.md参照)
    db.delete(quiz_set)
    db.commit()
