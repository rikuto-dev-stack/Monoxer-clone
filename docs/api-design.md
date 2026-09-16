# API設計書

## 1. 基本方針
- REST API、データ形式はJSON
- ベースパス: `/api`
- 主なHTTPステータスコード
  - 200 OK: 取得・更新・処理成功
  - 201 Created: 新規作成成功
  - 204 No Content: 削除成功(返すデータなし)
  - 400 Bad Request: 入力値が不正(例:選択肢が空、正解番号が1〜4の範囲外)
  - 404 Not Found: 指定したIDのデータが存在しない
- エラー時のレスポンス形式(FastAPIの標準形式に合わせる)
  ```json
  { "detail": "エラーメッセージ" }
  ```

## 2. 問題集(quiz-sets)

### GET /api/quiz-sets
問題集一覧を取得する。

レスポンス 200:
```json
[
  { "id": 1, "name": "基本情報技術者試験", "question_count": 20, "latest_accuracy": 0.85 }
]
```
(まだ一度もクイズに挑戦していない場合、latest_accuracyはnull)

### POST /api/quiz-sets
問題集を新規作成する。

リクエスト:
```json
{ "name": "基本情報技術者試験" }
```
レスポンス 201: 作成された問題集データ

### GET /api/quiz-sets/{id}
問題集の詳細(問題一覧つき)を取得する。※編集画面用なので正解番号も含む

レスポンス 200:
```json
{
  "id": 1,
  "name": "基本情報技術者試験",
  "questions": [
    {
      "id": 10, "question_text": "...",
      "choice_1": "...", "choice_2": "...", "choice_3": "...", "choice_4": "...",
      "correct_choice_number": 2
    }
  ]
}
```

### PUT /api/quiz-sets/{id}
問題集名を編集する。リクエスト・レスポンスはPOSTと同様。

### DELETE /api/quiz-sets/{id}
問題集を削除する(関連する問題・履歴もCASCADEで削除)。レスポンス 204。

## 3. 問題(questions)

### POST /api/quiz-sets/{id}/questions
問題を新規作成する。

リクエスト:
```json
{
  "question_text": "...",
  "choice_1": "...", "choice_2": "...", "choice_3": "...", "choice_4": "...",
  "correct_choice_number": 3
}
```
レスポンス 201: 作成された問題データ

### GET /api/questions/{id}
問題1件の詳細を取得する(編集フォームの初期表示用)。正解番号を含む。

### PUT /api/questions/{id}
問題を編集する。リクエストはPOSTと同様。

### DELETE /api/questions/{id}
問題を削除する。レスポンス 204。

## 4. クイズセッション(quiz-sessions)

### POST /api/quiz-sessions
クイズセッションを開始する。

リクエスト:
```json
{ "quiz_set_id": 1, "question_ids": [10, 11, 12] }
```
(`question_ids`は省略可。省略時はその問題集の全問が対象。「間違えた問題だけ再挑戦」の場合のみ指定する)

レスポンス 201:
```json
{
  "session_id": 55,
  "questions": [
    { "id": 10, "question_text": "...", "choice_1": "...", "choice_2": "...", "choice_3": "...", "choice_4": "..." }
  ]
}
```
出題順はバックエンドでランダムに並べ替えて返す。**正解番号(correct_choice_number)はレスポンスに含めない**(カンニング防止のため)。

### POST /api/quiz-sessions/{session_id}/answers
1問分の回答を送信する。

リクエスト:
```json
{ "question_id": 10, "selected_choice_number": 2 }
```
レスポンス 200:
```json
{ "is_correct": true, "correct_choice_number": 2 }
```
バックエンドは、この問題への回答がこのセッション内で初めてかどうかを自動判定し(`quiz_answers`に既存の記録があるか確認)、`is_first_attempt`として保存する。

### POST /api/quiz-sessions/{session_id}/finish
セッションを終了し、結果を確定する(全問「初回正解」になったタイミングでフロントエンドが呼び出す)。

レスポンス 200:
```json
{
  "total_questions": 20,
  "correct_count": 17,
  "accuracy": 0.85,
  "incorrect_question_ids": [3, 8, 15]
}
```
この時点で`quiz_sessions`の`finished_at`・`total_questions`・`correct_count`が確定保存される。`incorrect_question_ids`は「間違えた問題だけ再挑戦」ボタンで使う。

## 5. 学習履歴

### GET /api/quiz-sessions
過去のセッション一覧を取得する(完了したセッションのみ、新しい順)。

クエリパラメータ: `quiz_set_id`(絞り込み・省略可)、`limit`・`offset`(ページング)

レスポンス 200:
```json
[
  {
    "id": 55, "quiz_set_id": 1, "quiz_set_name": "基本情報技術者試験",
    "started_at": "2026-09-16T10:00:00", "finished_at": "2026-09-16T10:05:00",
    "total_questions": 20, "correct_count": 17
  }
]
```

### GET /api/quiz-sets/{id}/stats
問題集ごとの累積正答率を取得する(完了した全セッションを合算)。

レスポンス 200:
```json
{ "quiz_set_id": 1, "cumulative_correct": 120, "cumulative_total": 150, "cumulative_accuracy": 0.8 }
```