# システム構成

## 1. 全体構成

[ブラウザ]
   ↓ 画面を表示・操作
[フロントエンド (React + TypeScript)]  ── SPA(画面遷移をブラウザ内で処理)
   ↓ REST API(HTTPリクエスト、JSON形式でやり取り)
[バックエンド (Python + FastAPI)]  ── APIサーバー(データ処理・DBとのやり取り)
   ↓ SQL
[データベース (PostgreSQL)]  ── 問題集・問題・学習履歴などを保存

## 2. 技術スタック

| 層 | 技術 | 理由 |
|---|---|---|
| フロントエンド | React + TypeScript | 情報・学習教材が豊富で、実務での採用実績も多い |
| バックエンド | Python + FastAPI | 型情報を活かしたシンプルな記法、API仕様書(Swagger UI)が自動生成され学習しやすい |
| データベース | PostgreSQL | 要件定義で指定済み |
| フロントエンド-バックエンド間の通信 | REST API(JSON) | このアプリの規模ではシンプルなREST APIで十分なため |

## 3. リポジトリ構成

モノレポ構成(1つのリポジトリに frontend/ と backend/ をまとめる)

Monoxer-clone/
├── frontend/          # React + TypeScript のソースコード
├── backend/           # FastAPI (Python) のソースコード
├── docs/              # 要件定義書などのドキュメント
├── docker-compose.yml # DB・バックエンドのローカル起動設定
└── .gitignore



## 4. ローカル開発環境

- **データベース(PostgreSQL)・バックエンド(FastAPI)**: Docker Composeでコンテナとして起動する
  - 理由: 自分のPCに直接PostgreSQLをインストールしなくてよく、環境差異によるトラブルを防げる
- **フロントエンド(React)**: ローカルのNode.jsで直接起動する(`npm run dev` 等)
  - 理由: ホットリロード(保存した瞬間に画面が更新される機能)が快適に動作するため

## 5. 将来のデプロイについて(現時点では未確定)

将来的にAWSへのデプロイを予定しているが、具体的な構成(EC2+RDSか、サーバーレス構成か等)は
実装が進みデプロイが近づいた段階で改めて検討する。可能な限り無料枠(Free Tier)内で
運用したいという制約があるため、検討時にはコスト面を最優先で確認する。