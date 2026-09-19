import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteQuizSet, getQuizSets } from '../api/client'
import type { QuizSet } from '../types'

export function QuizSetListPage() {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    loadQuizSets()
  }, [])

  function loadQuizSets() {
    setIsLoading(true)
    getQuizSets()
      .then(setQuizSets)
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false))
  }

  // 削除は取り返しがつかないので、確認ダイアログを挟む(画面設計書で決めた仕様)
  async function handleDelete(quizSet: QuizSet) {
    const confirmed = window.confirm(`「${quizSet.name}」を削除しますか?`)
    if (!confirmed) return

    try {
      await deleteQuizSet(quizSet.id)
      loadQuizSets()
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  return (
    <div>
      <h1>問題集一覧</h1>
      <p>
        <Link to="/quiz-sets/new">＋ 新規作成</Link>
        {' '}
        <Link to="/history">履歴を見る</Link>
      </p>

      {isLoading && <p>読み込み中...</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <ul>
        {quizSets.map((quizSet) => (
          <li key={quizSet.id}>
            <Link to={`/quiz-sets/${quizSet.id}`}>{quizSet.name}</Link>
            (問題数: {quizSet.question_count}、直近正答率:{' '}
            {quizSet.latest_accuracy === null
              ? '未挑戦'
              : `${Math.round(quizSet.latest_accuracy * 100)}%`}
            )
            {' '}
            <Link to={`/quiz-sets/${quizSet.id}/edit`}>名前を編集</Link>
            {' '}
            <button onClick={() => handleDelete(quizSet)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
