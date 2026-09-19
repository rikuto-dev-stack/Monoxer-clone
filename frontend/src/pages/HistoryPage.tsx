import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getQuizSessions, getQuizSetStats, getQuizSets } from '../api/client'
import type { QuizSessionHistory, QuizSetStats } from '../types'

type QuizSetSummary = {
  id: number
  name: string
  stats: QuizSetStats
}

export function HistoryPage() {
  const [sessions, setSessions] = useState<QuizSessionHistory[]>([])
  const [quizSetSummaries, setQuizSetSummaries] = useState<QuizSetSummary[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    getQuizSessions()
      .then(setSessions)
      .catch((error: Error) => setErrorMessage(error.message))

    // 問題集ごとの累積正答率は、問題集一覧を取得してから1件ずつ集計APIを呼び出す
    getQuizSets()
      .then((quizSets) =>
        Promise.all(
          quizSets.map((quizSet) =>
            getQuizSetStats(quizSet.id).then((stats) => ({
              id: quizSet.id,
              name: quizSet.name,
              stats,
            })),
          ),
        ),
      )
      .then(setQuizSetSummaries)
      .catch((error: Error) => setErrorMessage(error.message))
  }, [])

  return (
    <div>
      <p>
        <Link to="/">← 問題集一覧に戻る</Link>
      </p>
      <h1>学習履歴</h1>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <h2>問題集ごとの累積正答率</h2>
      <ul>
        {quizSetSummaries.map((summary) => (
          <li key={summary.id}>
            {summary.name}:{' '}
            {summary.stats.cumulative_total === 0
              ? '未挑戦'
              : `${summary.stats.cumulative_correct} / ${summary.stats.cumulative_total}(${Math.round(
                  summary.stats.cumulative_accuracy * 100,
                )}%)`}
          </li>
        ))}
      </ul>

      <h2>挑戦履歴</h2>
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            {session.finished_at && new Date(session.finished_at).toLocaleString('ja-JP')} —{' '}
            {session.quiz_set_name}: {session.correct_count} / {session.total_questions}
          </li>
        ))}
      </ul>
    </div>
  )
}
