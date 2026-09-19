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


def _latest_accuracy(db: Session, quiz_set_id: int) -> float | None:
    # 一番最近「終了した」セッションの正答率を返す(未挑戦・進行中のみの場合はNone)
    latest_session = (
        db.query(models.QuizSession)
        .filter(
            models.QuizSession.quiz_set_id == quiz_set_id,
            models.QuizSession.finished_at.is_not(None),
        )
        .order_by(models.QuizSession.finished_at.desc())
        .first()
    )
    if latest_session is None or latest_session.total_questions == 0:
        return None
    return latest_session.correct_count / latest_session.total_questions


@router.get("", response_model=list[schemas.QuizSetOut])
def list_quiz_sets(db: Session = Depends(get_db)):
    quiz_sets = db.query(models.QuizSet).order_by(models.QuizSet.created_at.desc()).all()
    return [
        schemas.QuizSetOut(
            id=quiz_set.id,
            name=quiz_set.name,
            question_count=_count_questions(db, quiz_set.id),
            latest_accuracy=_latest_accuracy(db, quiz_set.id),
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
    return schemas.QuizSetDetailOut(
        id=quiz_set.id,
        name=quiz_set.name,
        questions=[schemas.QuestionOut.model_validate(q) for q in quiz_set.questions],
    )


@router.post(
    "/{quiz_set_id}/questions",
    response_model=schemas.QuestionOut,
    status_code=status.HTTP_201_CREATED,
)
def create_question(
    quiz_set_id: int, payload: schemas.QuestionCreate, db: Session = Depends(get_db)
):
    _get_quiz_set_or_404(db, quiz_set_id)  # 問題集が存在するか先に確認する
    question = models.Question(quiz_set_id=quiz_set_id, **payload.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


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
        latest_accuracy=_latest_accuracy(db, quiz_set.id),
    )


@router.delete("/{quiz_set_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz_set(quiz_set_id: int, db: Session = Depends(get_db)):
    quiz_set = _get_quiz_set_or_404(db, quiz_set_id)
    # ON DELETE CASCADEで問題・学習履歴も連動して削除される(db-design.md参照)
    db.delete(quiz_set)
    db.commit()


@router.get("/{quiz_set_id}/stats", response_model=schemas.QuizSetStatsOut)
def get_quiz_set_stats(quiz_set_id: int, db: Session = Depends(get_db)):
    _get_quiz_set_or_404(db, quiz_set_id)

    cumulative_correct, cumulative_total = (
        db.query(
            func.coalesce(func.sum(models.QuizSession.correct_count), 0),
            func.coalesce(func.sum(models.QuizSession.total_questions), 0),
        )
        .filter(
            models.QuizSession.quiz_set_id == quiz_set_id,
            models.QuizSession.finished_at.is_not(None),
        )
        .one()
    )
    cumulative_accuracy = cumulative_correct / cumulative_total if cumulative_total else 0.0

    return schemas.QuizSetStatsOut(
        quiz_set_id=quiz_set_id,
        cumulative_correct=cumulative_correct,
        cumulative_total=cumulative_total,
        cumulative_accuracy=cumulative_accuracy,
    )
