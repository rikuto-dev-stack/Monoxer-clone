import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createQuizSet, getQuizSet, updateQuizSet } from '../api/client'

// 新規作成・編集を同じフォームで共用する(画面設計書3.2準拠)
// URLに:idがあれば編集モード、なければ新規作成モードとして扱う
export function QuizSetFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = id !== undefined
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isEditMode) return
    getQuizSet(Number(id))
      .then((quizSet) => setName(quizSet.name))
      .catch((error: Error) => setErrorMessage(error.message))
  }, [id, isEditMode])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)

    try {
      if (isEditMode) {
        await updateQuizSet(Number(id), name)
      } else {
        await createQuizSet(name)
      }
      navigate('/')
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <h1>{isEditMode ? '問題集を編集' : '問題集を新規作成'}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          問題集名
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <div>
          <button type="submit" disabled={isSaving}>
            保存
          </button>
          <button type="button" onClick={() => navigate('/')}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
