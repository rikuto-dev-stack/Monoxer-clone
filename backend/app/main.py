from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  Base.metadata にテーブル定義を登録するために読み込む
from app.database import Base, engine
from app.routers import questions, quiz_sessions, quiz_sets


@asynccontextmanager
async def lifespan(app: FastAPI):
    # MVPのため、Alembicによるマイグレーション管理はまだ導入せず、
    # 起動時にモデル定義からテーブルを作成する簡易的な方法にしている(system-architecture.md参照)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Monoxer-chone API", lifespan=lifespan)

# フロントエンド(Vite開発サーバー)からのアクセスを許可する
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz_sets.router)
app.include_router(questions.router)
app.include_router(quiz_sessions.router)
