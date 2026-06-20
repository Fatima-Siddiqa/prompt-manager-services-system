import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchPrompt, updatePrompt } from '../api/prompts'
import { fetchSummary } from '../api/reviews'
import PromptForm from '../components/PromptForm'
import ReviewForm from '../components/ReviewForm'

export default function PromptDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState(null)
  const [summary, setSummary] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reviewKey, setReviewKey] = useState(0)

  async function load() {
    const data = await fetchPrompt(id)
    setPrompt(data)
  }

  async function loadSummary() {
    try {
      const s = await fetchSummary(id)
      setSummary(s)
    } catch {
      setSummary(null)
    }
  }

  useEffect(() => { load(); loadSummary() }, [id])

  async function handleUpdate(form) {
    setSaving(true)
    try {
      await updatePrompt(id, form)
      setEditing(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  if (!prompt) return (
    <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
      loading...
    </div>
  )

  const tags = prompt.tags ? prompt.tags.split(',') : []

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          marginBottom: '24px',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        ← back to prompts
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600' }}>{prompt.name}</h1>
          {prompt.description && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>{prompt.description}</p>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <span key={tag} style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                background: 'rgba(186,216,182,0.12)',
                color: 'var(--sage)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}>{tag.trim()}</span>
            ))}
            {prompt.model_target && (
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {prompt.model_target}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditing(s => !s)}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--dark-4)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
          }}
        >
          {editing ? 'Cancel Edit' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <div style={{
          background: 'var(--dark-3)',
          border: '1px solid var(--dark-4)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          marginBottom: '32px',
        }}>
          <PromptForm initial={prompt} onSubmit={handleUpdate} onCancel={() => setEditing(false)} loading={saving} />
        </div>
      ) : (
        <div style={{
          background: 'var(--dark-2)',
          border: '1px solid var(--dark-4)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          lineHeight: '1.8',
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          marginBottom: '32px',
        }}>
          {prompt.content}
        </div>
      )}

      {summary && (
        <div style={{
          background: 'var(--dark-3)',
          border: '1px solid var(--dark-4)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '32px',
          display: 'flex',
          gap: '32px',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>AVG SCORE</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--sage)', fontFamily: 'var(--font-mono)' }}>
              {summary.average_score}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/5</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>REVIEWS</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {summary.total_reviews}
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: 'var(--dark-3)',
        border: '1px solid var(--dark-4)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
      }}>
        <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px', color: 'var(--sage)', fontFamily: 'var(--font-mono)' }}>
          Submit a Review
        </h2>
        <ReviewForm
          key={reviewKey}
          promptId={id}
          onSubmitted={() => { setReviewKey(k => k + 1); loadSummary() }}
        />
      </div>
    </div>
  )
}