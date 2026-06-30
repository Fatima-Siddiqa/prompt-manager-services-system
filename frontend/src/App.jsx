import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PromptsPage from './pages/PromptsPage'
import PromptDetailPage from './pages/PromptDetailPage'
import ReviewsPage from './pages/ReviewsPage'
import ChatsListPage from './pages/ChatsListPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PromptsPage />} />
          <Route path="prompts/:id" element={<PromptDetailPage />} />
          <Route path="chats" element={<ChatsListPage />} />
          <Route path="chats/:chatId" element={<ChatPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}