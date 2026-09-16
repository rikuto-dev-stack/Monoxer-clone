import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 全てのモデル(テーブル定義)クラスはこのBaseを継承する
Base = declarative_base()


# FastAPIのDependsで各APIにDBセッションを渡すための関数。
# リクエストごとにセッションを作り、処理が終わったら必ず閉じる。
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
