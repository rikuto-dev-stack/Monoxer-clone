import random
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/quiz-sessions", tags=["quiz-sessions"])


def _get_session_or_404(db: Session, session_id: int) -> models.QuizSession:
    session = db.get(models.QuizSession, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="セッションが見つかりません")
    return session


@router.post("", response_model=schemas.QuizSessionStartResponse, status_code=status.HTTP_201_CREATED)
def start_quiz_session(payload: schemas.QuizSessionStartRequest, db: Session = Depends(get_db)):
    quiz_set = db.get(models.QuizSet, payload.quiz_set_id)
    if quiz_set is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="問題集が見つかりません")

    query = db.query(models.Question).filter(models.Question.quiz_set_id == payload.quiz_set_id)
    if payload.question_ids is not None:
        query = query.filter(models.Question.id.in_(payload.question_ids))
    questions = query.all()

    if not questions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="出題できる問題がありません")

    session = models.QuizSession(
        quiz_set_id=payload.quiz_set_id,
        total_questions=len(questions),
        correct_count=0,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # 出題順はランダムにする(要件定義書4.3)
    random.shuffle(questions)

    return schemas.QuizSessionStartResponse(
        session_id=session.id,
        questions=[schemas.QuizSessionQuestionOut.model_validate(q) for q in questions],
    )


@router.post("/{session_id}/answers", response_model=schemas.QuizAnswerResponse)
def submit_answer(session_id: int, payload: schemas.QuizAnswerRequest, db: Session = Depends(get_db)):
    session = _get_session_or_404(db, session_id)

    question = db.get(models.Question, payload.question_id)
    if question is None or question.quiz_set_id != session.quiz_set_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="問題が見つかりません")

    is_correct = payload.selected_choice_number == question.correct_choice_number

    # このセッション内でこの問題に回答するのが初めてかどうかを判定する。
    # 正答率は「初回回答が正解だったか」を基準に計算する方針のため(db-design.md参照)
    already_answered = (
        db.query(models.QuizAnswer)
        .filter(
            models.QuizAnswer.session_id == session_id,
            models.QuizAnswer.question_id == payload.question_id,
        )
        .first()
        is not None
    )
    is_first_attempt = not already_answered

    db.add(
        models.QuizAnswer(
            session_id=session_id,
            question_id=payload.question_id,
            is_correct=is_correct,
            is_first_attempt=is_first_attempt,
        )
    )

    if is_first_attempt and is_correct:
        session.correct_count += 1

    db.commit()

    return schemas.QuizAnswerResponse(is_correct=is_correct, correct_choice_number=question.correct_choice_number)


@router.post("/{session_id}/finish", response_model=schemas.QuizSessionFinishResponse)
def finish_quiz_session(session_id: int, db: Session = Depends(get_db)):
    session = _get_session_or_404(db, session_id)

    session.finished_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(session)

    incorrect_question_ids = [
        answer.question_id
        for answer in db.query(models.QuizAnswer)
        .filter(
            models.QuizAnswer.session_id == session_id,
            models.QuizAnswer.is_first_attempt.is_(True),
            models.QuizAnswer.is_correct.is_(False),
        )
        .all()
    ]

    accuracy = session.correct_count / session.total_questions if session.total_questions else 0.0

    return schemas.QuizSessionFinishResponse(
        total_questions=session.total_questions,
        correct_count=session.correct_count,
        accuracy=accuracy,
        incorrect_question_ids=incorrect_question_ids,
    )
