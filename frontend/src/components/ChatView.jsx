import { useState, useRef, useEffect } from 'react'
import { sendFollowUp, summarizeChat } from '../api/chats'
import JobPoller from './JobPoller'

export default function ChatView({ chat, onUpdated }) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [error, setError] = useState('')
  const [activeJobId, setActiveJobId] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.messages?.length])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return
    setSending(true)
    setError('')
    try {
      const job = await sendFollowUp(chat.id, input.trim())
      setInput('')
      setActiveJobId(job.job_id)
    } catch (err) {
      setError(err.message)
      setSending(false)
    }
  }

  function handleJobDone(result) {
    setActiveJobId(null)
    setSending(false)
    onUpdated(result) // pass result directly so parent can update chat
  }

  function handleJobError(err) {
    setActiveJobId(null)
    setSending(false)
    setError(err)
  }

  async function handleSummarize() {
    setSummarizing(true)
    setError('')
    try {
      await summarizeChat(chat.id)
      onUpdated()
    } catch (err) {
      setError(`Summarize failed: ${err.message}`)
    } finally {
      setSummarizing(false)
    }
  }

  const bubbleStyle = (role) => ({
    maxWidth: '75%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    background: role === 'user' ? 'rgba(186,216,182,0.12)' : 'var(--dark-3)',
    border: '1px solid var(--dark-4)',
    borderRadius: 'var(--radius-lg)',
    padding: '12px 16px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--text-primary)',
    whiteSpace: 'pre-wrap',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--dark-4)',
        marginBottom: '16px',
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {chat.title}
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
            {chat.total_tokens} tokens total
          </div>
        </div>
        <button
          onClick={handleSummarize}
          disabled={summarizing}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--sage)',
            borderRadius: 'var(--radius)',
            color: 'var(--sage)',
            fontSize: '13px',
            cursor: 'pointer',
            opacity: summarizing ? 0.6 : 1,
          }}
        >
          {summarizing ? 'Summarizing...' : 'Summarize'}
        </button>
      </div>

      {/* Summary panel */}
      {chat.summary && (
        <div style={{
          background: 'rgba(186,216,182,0.08)',
          border: '1px solid var(--dark-4)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          marginBottom: '20px',
          fontSize: '13px',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
        }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--sage)', marginBottom: '6px', textTransform: 'uppercase' }}>
            Summary
          </div>
          {chat.summary}
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        paddingBottom: '16px',
      }}>
        {chat.messages.map(m => (
          <div key={m.id} style={bubbleStyle(m.role)}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              {m.role}
              {m.role === 'assistant' && m.total_tokens > 0
                ? ` · ${m.prompt_tokens} in / ${m.completion_tokens} out / ${m.total_tokens} total`
                : ''}
            </div>
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Job poller */}
      {activeJobId && (
        <div style={{ marginBottom: '8px' }}>
          <JobPoller
            jobId={activeJobId}
            onDone={handleJobDone}
            onError={handleJobError}
          />
        </div>
      )}

      {error && (
        <div style={{ 
          fontSize: '13px', 
          color: 'var(--danger)', 
          fontFamily: 'var(--font-mono)', 
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '8px',
          background: 'rgba(224,112,112,0.08)',
          border: '1px solid rgba(224,112,112,0.2)',
          borderRadius: 'var(--radius)',
          padding: '10px 12px',
        }}>
          <span>✕ {error}</span>
          <button
            onClick={() => setError('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--danger)',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--dark-4)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a follow-up message..."
          disabled={sending || !!activeJobId}
          style={{
            flex: 1,
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-4)',
            borderRadius: 'var(--radius)',
            padding: '10px 14px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button type="submit" disabled={sending || !input.trim() || !!activeJobId} style={{
          padding: '10px 20px',
          background: 'var(--sage)',
          border: 'none',
          borderRadius: 'var(--radius)',
          color: 'var(--dark)',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          opacity: sending || !input.trim() || !!activeJobId ? 0.6 : 1,
        }}>
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}