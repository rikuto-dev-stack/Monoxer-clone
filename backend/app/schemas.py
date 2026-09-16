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
