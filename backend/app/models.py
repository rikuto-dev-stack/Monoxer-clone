from sqlalchemy import (
    TIMESTAMP,
    Boolean,
    CheckConstraint,
    Column,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base

# docs/db-design.md のテーブル定義に対応するSQLAlchemyモデル。


class QuizSet(Base):
    __tablename__ = "quiz_sets"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())

    questions = relationship("Question", back_populates="quiz_set", cascade="all, delete-orphan")
    quiz_sessions = relationship("QuizSession", back_populates="quiz_set", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    quiz_set_id = Column(Integer, ForeignKey("quiz_sets.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    choice_1 = Column(Text, nullable=False)
    choice_2 = Column(Text, nullable=False)
    choice_3 = Column(Text, nullable=False)
    choice_4 = Column(Text, nullable=False)
    correct_choice_number = Column(SmallInteger, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint(
            "correct_choice_number BETWEEN 1 AND 4", name="ck_questions_correct_choice_number"
        ),
    )

    quiz_set = relationship("QuizSet", back_populates="questions")
    quiz_answers = relationship("QuizAnswer", back_populates="question", cascade="all, delete-orphan")


class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id = Column(Integer, primary_key=True)
    quiz_set_id = Column(Integer, ForeignKey("quiz_sets.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    finished_at = Column(TIMESTAMP, nullable=True)
    total_questions = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False, default=0)

    quiz_set = relationship("QuizSet", back_populates="quiz_sessions")
    quiz_answers = relationship("QuizAnswer", back_populates="session", cascade="all, delete-orphan")


class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("quiz_sessions.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    # このセッション内でこの問題に初めて回答した記録かどうか。正答率の集計に使う(db-design.md参照)
    is_first_attempt = Column(Boolean, nullable=False)
    answered_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    session = relationship("QuizSession", back_populates="quiz_answers")
    question = relationship("Question", back_populates="quiz_answers")
