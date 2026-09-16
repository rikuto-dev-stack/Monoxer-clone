import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createQuestion, getQuestion, updateQuestion } from '../api/client'

// 新規作成・編集を同じフォームで共用する(画面設計書3.4準拠)
// 新規作成時はURLに:quizSetId、編集時は:questionIdが入る
export function QuestionFormPage() {
  const { quizSetId, questionId } = useParams<{ quizSetId?: string; questionId?: string }>()
  const isEditMode = questionId !== undefined
  const navigate = useNavigate()

  const [questionText, setQuestionText] = useState('')
  const [choices, setChoices] = useState(['', '', '', ''])
  const [correctChoiceNumber, setCorrectChoiceNumber] = useState(1)
  const [linkedQuizSetId, setLinkedQuizSetId] = useState<number | null>(
    quizSetId ? Number(quizSetId) : null,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isEditMode) return
    getQuestion(Number(questionId))
      .then((question) => {
        setQuestionText(question.question_text)
        setChoices([question.choice_1, question.choice_2, question.choice_3, question.choice_4])
        setCorrectChoiceNumber(question.correct_choice_number)
        setLinkedQuizSetId(question.quiz_set_id)
      })
      .catch((error: Error) => setErrorMessage(error.message))
  }, [questionId, isEditMode])

  function handleChoiceChange(index: number, value: string) {
    setChoices((prev) => prev.map((choice, i) => (i === index ? value : choice)))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)

    const payload = {
      question_text: questionText,
      choice_1: choices[0],
      choice_2: choices[1],
      choice_3: choices[2],
      choice_4: choices[3],
      correct_choice_number: correctChoiceNumber,
    }

    try {
      if (isEditMode) {
        await updateQuestion(Number(questionId), payload)
      } else {
        await createQuestion(Number(quizSetId), payload)
      }
      navigate(`/quiz-sets/${linkedQuizSetId}`)
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <h1>{isEditMode ? '問題を編集' : '問題を新規作成'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            問題文
            <br />
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
            />
          </label>
        </div>

        {choices.map((choice, index) => (
          <div key={index}>
            <label>
              選択肢{index + 1}
              <input value={choice} onChange={(e) => handleChoiceChange(index, e.target.value)} required />
            </label>
            {' '}
            <label>
              <input
                type="radio"
                name="correct_choice_number"
                checked={correctChoiceNumber === index + 1}
                onChange={() => setCorrectChoiceNumber(index + 1)}
              />
              これが正解
            </label>
          </div>
        ))}

        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <div>
          <button type="submit" disabled={isSaving}>
            保存
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
