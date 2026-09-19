from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

# docs/api-design.md のリクエスト/レスポンス形式に対応するPydanticスキーマ。


class QuizSetCreate(BaseModel):
    name: str


class QuizSetUpdate(BaseModel):
    name: str


class QuizSetOut(BaseModel):
    id: int
    name: str
    question_count: int
    latest_accuracy: float | None = None


class QuestionBase(BaseModel):
    question_text: str
    choice_1: str
    choice_2: str
    choice_3: str
    choice_4: str
    # 1〜4の範囲外はここで弾く(DB側のCHECK制約より先にAPIレベルで検証する)
    correct_choice_number: int = Field(ge=1, le=4)


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(QuestionBase):
    pass


class QuestionOut(QuestionBase):
    # SQLAlchemyのモデルインスタンスから直接変換できるようにする
    model_config = ConfigDict(from_attributes=True)

    id: int
    quiz_set_id: int


class QuizSetDetailOut(BaseModel):
    id: int
    name: str
    questions: list[QuestionOut] = []


class QuizSessionStartRequest(BaseModel):
    quiz_set_id: int
    # 指定した場合はその問題だけを出題する(「間違えた問題だけ再挑戦」用)。省略時は問題集の全問が対象
    question_ids: list[int] | None = None


class QuizSessionQuestionOut(BaseModel):
    # 出題中は正解(correct_choice_number)を含めない(カンニング防止、api-design.md参照)
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_text: str
    choice_1: str
    choice_2: str
    choice_3: str
    choice_4: str


class QuizSessionStartResponse(BaseModel):
    session_id: int
    questions: list[QuizSessionQuestionOut]


class QuizAnswerRequest(BaseModel):
    question_id: int
    selected_choice_number: int = Field(ge=1, le=4)


class QuizAnswerResponse(BaseModel):
    is_correct: bool
    correct_choice_number: int


class QuizSessionFinishResponse(BaseModel):
    total_questions: int
    correct_count: int
    accuracy: float
    incorrect_question_ids: list[int]


class QuizSessionHistoryOut(BaseModel):
    id: int
    quiz_set_id: int
    quiz_set_name: str
    started_at: datetime
    finished_at: datetime | None
    total_questions: int
    correct_count: int


class QuizSetStatsOut(BaseModel):
    quiz_set_id: int
    cumulative_correct: int
    cumulative_total: int
    cumulative_accuracy: float
