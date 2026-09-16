from pydantic import BaseModel

# docs/api-design.md の2章(問題集)に対応するリクエスト/レスポンス形式。


class QuizSetCreate(BaseModel):
    name: str


class QuizSetUpdate(BaseModel):
    name: str


class QuizSetOut(BaseModel):
    id: int
    name: str
    question_count: int
    latest_accuracy: float | None = None


class QuizSetDetailOut(BaseModel):
    id: int
    name: str
    # Stage 1時点では問題管理機能が未実装のため、常に空配列を返す
    questions: list = []
