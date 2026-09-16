# DB設計書

## 1. テーブル一覧
1. quiz_sets(問題集)
2. questions(問題)
3. quiz_sessions(クイズセッション)
4. quiz_answers(回答履歴)

## 2. テーブル関連図

quiz_sets (1) ── (多) questions
quiz_sets (1) ── (多) quiz_sessions
quiz_sessions (1) ── (多) quiz_answers
questions (1) ── (多) quiz_answers

削除時の挙動: quiz_setsを削除すると、紐づくquestions・quiz_sessions・quiz_answersも
連動して削除される(CASCADE)。questionsを1件削除した場合も、そのquestionに紐づく
quiz_answersのみ連動して削除される。

## 3. 各テーブルの詳細

### 3.1 quiz_sets(問題集)
| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | 問題集ID |
| name | VARCHAR(255) | NOT NULL | 問題集名 |
| created_at | TIMESTAMP | NOT NULL DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL DEFAULT now() | 更新日時 |

### 3.2 questions(問題)
| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | 問題ID |
| quiz_set_id | INTEGER | NOT NULL, REFERENCES quiz_sets(id) ON DELETE CASCADE | 所属する問題集 |
| question_text | TEXT | NOT NULL | 問題文 |
| choice_1〜choice_4 | TEXT | NOT NULL | 選択肢1〜4 |
| correct_choice_number | SMALLINT | NOT NULL, CHECK (1〜4) | 正解の選択肢番号 |
| created_at / updated_at | TIMESTAMP | NOT NULL DEFAULT now() | 作成・更新日時 |

### 3.3 quiz_sessions(クイズセッション)
| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | セッションID |
| quiz_set_id | INTEGER | NOT NULL, REFERENCES quiz_sets(id) ON DELETE CASCADE | 挑戦した問題集 |
| started_at | TIMESTAMP | NOT NULL DEFAULT now() | 開始日時 |
| finished_at | TIMESTAMP | NULL可 | 終了日時(全問正解した時点) |
| total_questions | INTEGER | NOT NULL | 対象問題数 |
| correct_count | INTEGER | NOT NULL DEFAULT 0 | 初回正解数 |

### 3.4 quiz_answers(回答履歴)
| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | 回答履歴ID |
| session_id | INTEGER | NOT NULL, REFERENCES quiz_sessions(id) ON DELETE CASCADE | どのセッションか |
| question_id | INTEGER | NOT NULL, REFERENCES questions(id) ON DELETE CASCADE | どの問題への回答か |
| is_correct | BOOLEAN | NOT NULL | 正解したか |
| is_first_attempt | BOOLEAN | NOT NULL | セッション内でその問題への初回回答か |
| answered_at | TIMESTAMP | NOT NULL DEFAULT now() | 回答日時 |

## 4. テーブル作成SQL(DDL)

\`\`\`sql
CREATE TABLE quiz_sets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_set_id INTEGER NOT NULL REFERENCES quiz_sets(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    choice_1 TEXT NOT NULL,
    choice_2 TEXT NOT NULL,
    choice_3 TEXT NOT NULL,
    choice_4 TEXT NOT NULL,
    correct_choice_number SMALLINT NOT NULL CHECK (correct_choice_number BETWEEN 1 AND 4),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE quiz_sessions (
    id SERIAL PRIMARY KEY,
    quiz_set_id INTEGER NOT NULL REFERENCES quiz_sets(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL DEFAULT now(),
    finished_at TIMESTAMP,
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE quiz_answers (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    is_first_attempt BOOLEAN NOT NULL,
    answered_at TIMESTAMP NOT NULL DEFAULT now()
);
\`\`\`