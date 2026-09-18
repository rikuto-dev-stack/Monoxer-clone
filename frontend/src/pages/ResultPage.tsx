import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { QuizSessionFinishResponse } from '../types'

type LocationState = {
  result?: QuizSessionFinishResponse
}

// 画面設計書3.6準拠。結果は直前のクイズ出題画面から画面遷移時に渡される(location.state)
export function ResultPage() {
  const { quizSetId } = useParams<{ quizSetId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const result = (location.state as LocationState | null)?.result

  if (!result) {
    return (
      <div>
        <p>結果データがありません(このページを直接開くことはできません)。</p>
        <Link to={`/quiz-sets/${quizSetId}`}>問題集に戻る</Link>
      </div>
    )
  }

  function handleRetryAll() {
    navigate(`/quiz-sets/${quizSetId}/play`)
  }

  function handleRetryIncorrect() {
    navigate(`/quiz-sets/${quizSetId}/play`, {
      state: { questionIds: result!.incorrect_question_ids },
    })
  }

  return (
    <div>
      <h1>結果</h1>
      <p>
        正解数: {result.correct_count} / {result.total_questions}
        (正答率: {Math.round(result.accuracy * 100)}%)
      </p>
      <div>
        <button onClick={handleRetryAll}>同じ問題集をもう一度</button>
        {result.incorrect_question_ids.length > 0 && (
          <button onClick={handleRetryIncorrect}>間違えた問題だけ再挑戦</button>
        )}
      </div>
      <p>
        <Link to={`/quiz-sets/${quizSetId}`}>問題集に戻る</Link>
      </p>
      <p>
        <Link to="/">問題集一覧に戻る</Link>
      </p>
    </div>
  )
}
