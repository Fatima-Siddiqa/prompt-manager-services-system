import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchChats } from '../api/chats'

export default function ChatsListPage() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchChats().then(setChats).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
      loading...
    </div>
  )

  if (chats.length === 0) return (
    <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
      No chats yet. Execute a prompt to start one.
    </div>
  )

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>Chats</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {chats.map(chat => (
          <div
            key={chat.id}
            onClick={() => navigate(`/chats/${chat.id}`)}
            style={{
              background: 'var(--dark-3)',
              border: '1px solid var(--dark-4)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {chat.title}
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '4px' }}>
                {chat.total_tokens} tokens · updated {new Date(chat.updated_at).toLocaleString()}
              </div>
            </div>
            {chat.summary && (
              <div style={{ fontSize: '11px', color: 'var(--sage)', fontFamily: 'var(--font-mono)' }}>
                summarized
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}