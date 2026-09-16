import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QuestionFormPage } from './pages/QuestionFormPage'
import { QuizSetDetailPage } from './pages/QuizSetDetailPage'
import { QuizSetFormPage } from './pages/QuizSetFormPage'
import { QuizSetListPage } from './pages/QuizSetListPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizSetListPage />} />
        <Route path="/quiz-sets/new" element={<QuizSetFormPage />} />
        <Route path="/quiz-sets/:id/edit" element={<QuizSetFormPage />} />
        <Route path="/quiz-sets/:id" element={<QuizSetDetailPage />} />
        <Route path="/quiz-sets/:quizSetId/questions/new" element={<QuestionFormPage />} />
        <Route path="/questions/:questionId/edit" element={<QuestionFormPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
