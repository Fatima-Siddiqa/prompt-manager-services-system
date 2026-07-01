import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchChat, deleteChat } from '../api/chats'
import { fetchChatSummary } from '../api/reviews'
import ChatView from '../components/ChatView'
import ReviewForm from '../components/ReviewForm'

export default function ChatPage() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const [chat, setChat] = useState(null)
  const [reviewSummary, setReviewSummary] = useState(null)
  const [reviewKey, setReviewKey] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)

  async function load(result = null) {
    if (result) {
      setChat(result)
    } else {
      const data = await fetchChat(chatId)
      setChat(data)
    }
  }

  async function loadReviewSummary() {
    try {
      const s = await fetchChatSummary(chatId)
      setReviewSummary(s)
    } catch {
      setReviewSummary(null)
    }
  }

  useEffect(() => { load(); loadReviewSummary() }, [chatId])

  async function handleDelete() {
    if (!confirm('Delete this chat? This cannot be undone.')) return
    await deleteChat(chatId)
    navigate('/chats')
  }

  if (!chat) return (
    <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
      loading...
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/chats')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          ← back to chats
        </button>
        <button
          onClick={handleDelete}
          style={{
            background: 'transparent',
            border: '1px solid var(--dark-4)',
            borderRadius: 'var(--radius)',
            color: 'var(--danger)',
            fontSize: '12px',
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          Delete chat
        </button>
      </div>

      <div style={{ height: '60vh', minHeight: '400px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ChatView chat={chat} onUpdated={load} />
      </div>

      {reviewSummary && (
        <div style={{
          background: 'var(--dark-3)',
          border: '1px solid var(--dark-4)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginTop: '20px',
          display: 'flex',
          gap: '32px',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>AVG SCORE</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--sage)', fontFamily: 'var(--font-mono)' }}>
              {reviewSummary.average_score}<span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/5</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>REVIEWS</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {reviewSummary.total_reviews}
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: 'var(--dark-3)',
        border: '1px solid var(--dark-4)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginTop: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: showReviewForm ? '16px' : 0,
        }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--sage)',
            fontFamily: 'var(--font-mono)',
            margin: 0,
          }}>
            Review this Conversation
          </h2>
          <button
            onClick={() => setShowReviewForm(s => !s)}
            style={{
              background: 'transparent',
              border: '1px solid var(--dark-4)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-muted)',
              fontSize: '12px',
              padding: '4px 12px',
              cursor: 'pointer',
            }}
          >
            {showReviewForm ? 'Cancel' : 'Leave a Review'}
          </button>
        </div>

        {showReviewForm && (
          <ReviewForm
            key={reviewKey}
            chatId={chatId}
            onSubmitted={() => {
              setReviewKey(k => k + 1)
              setShowReviewForm(false)
              loadReviewSummary()
            }}
          />
        )}
      </div>
    </div>
  )
}