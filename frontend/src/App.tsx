import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QuestionFormPage } from './pages/QuestionFormPage'
import { QuizPlayPage } from './pages/QuizPlayPage'
import { QuizSetDetailPage } from './pages/QuizSetDetailPage'
import { QuizSetFormPage } from './pages/QuizSetFormPage'
import { QuizSetListPage } from './pages/QuizSetListPage'
import { ResultPage } from './pages/ResultPage'

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
        <Route path="/quiz-sets/:quizSetId/play" element={<QuizPlayPage />} />
        <Route path="/quiz-sets/:quizSetId/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
