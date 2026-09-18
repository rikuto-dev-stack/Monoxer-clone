import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { finishQuizSession, startQuizSession, submitAnswer } from '../api/client'
import type { QuizSessionFinishResponse, QuizSessionQuestion } from '../types'

// 正誤を表示してから次の問題に進むまでの待ち時間(画面設計書3.4準拠)
const FEEDBACK_DELAY_MS = 1500

type LocationState = {
  questionIds?: number[]
}

export function QuizPlayPage() {
  const { quizSetId } = useParams<{ quizSetId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const questionIds = (location.state as LocationState | null)?.questionIds

  const [sessionId, setSessionId] = useState<number | null>(null)
  const [queue, setQueue] = useState<QuizSessionQuestion[]>([])
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctChoiceNumber: number } | null>(
    null,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // 「初回正解した問題」の集合。進捗表示と、正答率の考え方(初回正解が基準)を画面上でも一致させるために使う
  const clearedQuestionIdsRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    startQuizSession(Number(quizSetId), questionIds)
      .then((res) => {
        setSessionId(res.session_id)
        setQueue(res.questions)
        setTotalQuestions(res.questions.length)
      })
      .catch((error: Error) => setErrorMessage(error.message))
    // 初回マウント時にのみセッションを開始する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 残りの問題がなくなったらセッションを終了し、結果画面へ遷移する
  useEffect(() => {
    if (!sessionId || totalQuestions === 0 || queue.length > 0 || feedback) return

    finishQuizSession(sessionId)
      .then((result: QuizSessionFinishResponse) => {
        navigate(`/quiz-sets/${quizSetId}/result`, { state: { result } })
      })
      .catch((error: Error) => setErrorMessage(error.message))
  }, [queue, sessionId, totalQuestions, feedback, navigate, quizSetId])

  async function handleAnswer(choiceNumber: number) {
    if (!sessionId || feedback || queue.length === 0) return
    const question = queue[0]

    try {
      const result = await submitAnswer(sessionId, question.id, choiceNumber)
      setFeedback({ isCorrect: result.is_correct, correctChoiceNumber: result.correct_choice_number })

      if (result.is_correct) {
        clearedQuestionIdsRef.current.add(question.id)
      }

      setTimeout(() => {
        setFeedback(null)
        setQueue((prev) => {
          const [current, ...rest] = prev
          // 正解した問題はキューから外し、間違えた問題は最後に回してこのセッション内で再出題する
          return result.is_correct ? rest : [...rest, current]
        })
      }, FEEDBACK_DELAY_MS)
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  if (errorMessage) {
    return <p style={{ color: 'red' }}>{errorMessage}</p>
  }

  if (queue.length === 0) {
    return <p>読み込み中...</p>
  }

  const currentQuestion = queue[0]
  const choices = [
    currentQuestion.choice_1,
    currentQuestion.choice_2,
    currentQuestion.choice_3,
    currentQuestion.choice_4,
  ]

  return (
    <div>
      <p>
        進捗: {clearedQuestionIdsRef.current.size} / {totalQuestions}
      </p>
      <h1>{currentQuestion.question_text}</h1>
      <ul>
        {choices.map((choiceText, index) => {
          const choiceNumber = index + 1
          return (
            <li key={choiceNumber}>
              <button disabled={feedback !== null} onClick={() => handleAnswer(choiceNumber)}>
                {choiceText}
              </button>
            </li>
          )
        })}
      </ul>
      {feedback && (
        <p style={{ color: feedback.isCorrect ? 'green' : 'red' }}>
          {feedback.isCorrect ? '正解!' : `不正解(正解は選択肢${feedback.correctChoiceNumber})`}
        </p>
      )}
    </div>
  )
}
