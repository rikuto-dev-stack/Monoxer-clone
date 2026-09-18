// 問題集一覧などで使う型(バックエンドのQuizSetOutスキーマに対応)
export type QuizSet = {
  id: number
  name: string
  question_count: number
  latest_accuracy: number | null
}

// 問題(バックエンドのQuestionOutスキーマに対応)
export type Question = {
  id: number
  quiz_set_id: number
  question_text: string
  choice_1: string
  choice_2: string
  choice_3: string
  choice_4: string
  correct_choice_number: number
}

// 問題作成・編集フォームで送信するデータの形(idやquiz_set_idはサーバー側で決まるため含まない)
export type QuestionInput = {
  question_text: string
  choice_1: string
  choice_2: string
  choice_3: string
  choice_4: string
  correct_choice_number: number
}

// 問題集詳細(バックエンドのQuizSetDetailOutスキーマに対応)
export type QuizSetDetail = {
  id: number
  name: string
  questions: Question[]
}

// クイズ出題中の問題(正解の選択肢番号は含まれない。カンニング防止のため)
export type QuizSessionQuestion = {
  id: number
  question_text: string
  choice_1: string
  choice_2: string
  choice_3: string
  choice_4: string
}

export type QuizSessionStartResponse = {
  session_id: number
  questions: QuizSessionQuestion[]
}

export type QuizAnswerResponse = {
  is_correct: boolean
  correct_choice_number: number
}

export type QuizSessionFinishResponse = {
  total_questions: number
  correct_count: number
  accuracy: number
  incorrect_question_ids: number[]
}
