import type {
  Question,
  QuestionInput,
  QuizAnswerResponse,
  QuizSessionFinishResponse,
  QuizSessionHistory,
  QuizSessionStartResponse,
  QuizSet,
  QuizSetDetail,
  QuizSetStats,
} from '../types'

// バックエンドのURLは環境変数(.envのVITE_API_BASE_URL)から読み込む
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// レスポンスの共通処理。エラー時はバックエンドが返す { detail: "..." } を例外として投げる
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body?.detail ?? `リクエストに失敗しました(status: ${response.status})`
    throw new Error(message)
  }
  // 204 No Content(削除成功時など)はレスポンスボディがない
  if (response.status === 204) {
    return null as T
  }
  return response.json() as Promise<T>
}

export function getQuizSets(): Promise<QuizSet[]> {
  return fetch(`${API_BASE_URL}/api/quiz-sets`).then((res) => handleResponse<QuizSet[]>(res))
}

export function getQuizSet(id: number): Promise<QuizSetDetail> {
  return fetch(`${API_BASE_URL}/api/quiz-sets/${id}`).then((res) => handleResponse<QuizSetDetail>(res))
}

export function createQuizSet(name: string): Promise<QuizSet> {
  return fetch(`${API_BASE_URL}/api/quiz-sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }).then((res) => handleResponse<QuizSet>(res))
}

export function updateQuizSet(id: number, name: string): Promise<QuizSet> {
  return fetch(`${API_BASE_URL}/api/quiz-sets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }).then((res) => handleResponse<QuizSet>(res))
}

export function deleteQuizSet(id: number): Promise<null> {
  return fetch(`${API_BASE_URL}/api/quiz-sets/${id}`, {
    method: 'DELETE',
  }).then((res) => handleResponse<null>(res))
}

export function getQuestion(id: number): Promise<Question> {
  return fetch(`${API_BASE_URL}/api/questions/${id}`).then((res) => handleResponse<Question>(res))
}

export function createQuestion(quizSetId: number, input: QuestionInput): Promise<Question> {
  return fetch(`${API_BASE_URL}/api/quiz-sets/${quizSetId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((res) => handleResponse<Question>(res))
}

export function updateQuestion(id: number, input: QuestionInput): Promise<Question> {
  return fetch(`${API_BASE_URL}/api/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((res) => handleResponse<Question>(res))
}

export function deleteQuestion(id: number): Promise<null> {
  return fetch(`${API_BASE_URL}/api/questions/${id}`, {
    method: 'DELETE',
  }).then((res) => handleResponse<null>(res))
}

// question_idsを指定すると、その問題だけを出題する(「間違えた問題だけ再挑戦」用)
export function startQuizSession(
  quizSetId: number,
  questionIds?: number[],
): Promise<QuizSessionStartResponse> {
  return fetch(`${API_BASE_URL}/api/quiz-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quiz_set_id: quizSetId, question_ids: questionIds ?? null }),
  }).then((res) => handleResponse<QuizSessionStartResponse>(res))
}

export function submitAnswer(
  sessionId: number,
  questionId: number,
  selectedChoiceNumber: number,
): Promise<QuizAnswerResponse> {
  return fetch(`${API_BASE_URL}/api/quiz-sessions/${sessionId}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_id: questionId, selected_choice_number: selectedChoiceNumber }),
  }).then((res) => handleResponse<QuizAnswerResponse>(res))
}

export function finishQuizSession(sessionId: number): Promise<QuizSessionFinishResponse> {
  return fetch(`${API_BASE_URL}/api/quiz-sessions/${sessionId}/finish`, {
    method: 'POST',
  }).then((res) => handleResponse<QuizSessionFinishResponse>(res))
}

export function getQuizSessions(): Promise<QuizSessionHistory[]> {
  return fetch(`${API_BASE_URL}/api/quiz-sessions`).then((res) => handleResponse<QuizSessionHistory[]>(res))
}

export function getQuizSetStats(quizSetId: number): Promise<QuizSetStats> {
  return fetch(`${API_BASE_URL}/api/quiz-sets/${quizSetId}/stats`).then((res) =>
    handleResponse<QuizSetStats>(res),
  )
}
