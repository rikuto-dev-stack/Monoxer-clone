import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QuizSetFormPage } from './pages/QuizSetFormPage'
import { QuizSetListPage } from './pages/QuizSetListPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizSetListPage />} />
        <Route path="/quiz-sets/new" element={<QuizSetFormPage />} />
        <Route path="/quiz-sets/:id/edit" element={<QuizSetFormPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
