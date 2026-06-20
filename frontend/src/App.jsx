import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PromptsPage from './pages/PromptsPage'
import PromptDetailPage from './pages/PromptDetailPage'
import ReviewsPage from './pages/ReviewsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PromptsPage />} />
          <Route path="prompts/:id" element={<PromptDetailPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}