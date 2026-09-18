import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { deleteQuestion, getQuizSet } from '../api/client'
import type { QuizSetDetail } from '../types'

export function QuizSetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const quizSetId = Number(id)

  const [quizSet, setQuizSet] = useState<QuizSetDetail | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    loadQuizSet()
  }, [quizSetId])

  function loadQuizSet() {
    getQuizSet(quizSetId)
      .then(setQuizSet)
      .catch((error: Error) => setErrorMessage(error.message))
  }

  // 削除は取り返しがつかないので、確認ダイアログを挟む(画面設計書で決めた仕様)
  async function handleDelete(questionId: number) {
    const confirmed = window.confirm('この問題を削除しますか?')
    if (!confirmed) return

    try {
      await deleteQuestion(questionId)
      loadQuizSet()
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  if (errorMessage) {
    return <p style={{ color: 'red' }}>{errorMessage}</p>
  }

  if (!quizSet) {
    return <p>読み込み中...</p>
  }

  return (
    <div>
      <p>
        <Link to="/">← 問題集一覧に戻る</Link>
      </p>
      <h1>{quizSet.name}</h1>
      <p>
        <Link to={`/quiz-sets/${quizSet.id}/edit`}>問題集名を編集</Link>
      </p>
      <p>
        <Link to={`/quiz-sets/${quizSet.id}/questions/new`}>＋ 問題を追加</Link>
      </p>
      {quizSet.questions.length > 0 && (
        <p>
          <Link to={`/quiz-sets/${quizSet.id}/play`}>クイズ開始</Link>
        </p>
      )}

      <ul>
        {quizSet.questions.map((question) => (
          <li key={question.id}>
            {question.question_text}
            {' '}
            <Link to={`/questions/${question.id}/edit`}>編集</Link>
            {' '}
            <button onClick={() => handleDelete(question.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
