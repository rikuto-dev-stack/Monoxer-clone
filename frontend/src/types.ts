// 問題集一覧などで使う型(バックエンドのQuizSetOutスキーマに対応)
export type QuizSet = {
  id: number
  name: string
  question_count: number
  latest_accuracy: number | null
}

// 問題集詳細(バックエンドのQuizSetDetailOutスキーマに対応)
// questionsはStage 1時点では常に空配列
export type QuizSetDetail = {
  id: number
  name: string
  questions: unknown[]
}
