import { useState } from 'react'
import { createReview } from '../api/reviews'

export default function ReviewForm({ promptId, onSubmitted }) {
  const [form, setForm] = useState({ reviewer_name: '', score: 3, feedback: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createReview({ ...form, prompt_id: promptId, score: Number(form.score) })
      onSubmitted()
      setForm({ reviewer_name: '', score: 3, feedback: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--dark-2)',
    border: '1px solid var(--dark-4)',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
  }

  const labelStyle = {
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Your Name *</label>
          <input
            style={inputStyle}
            value={form.reviewer_name}
            onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
            placeholder="Reviewer name"
            required
          />
        </div>
        <div>
          <label style={labelStyle}>Score *</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setForm(f => ({ ...f, score: n }))}
                style={{
                  width: '36px',
                  height: '40px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid',
                  borderColor: form.score === n ? 'var(--sage)' : 'var(--dark-4)',
                  background: form.score === n ? 'rgba(186,216,182,0.15)' : 'var(--dark-2)',
                  color: form.score === n ? 'var(--sage)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Feedback *</label>
        <textarea
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          value={form.feedback}
          onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))}
          placeholder="Your written feedback on this prompt..."
          required
        />
      </div>

      {error && (
        <div style={{ fontSize: '13px', color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
          ✕ {error}
        </div>
      )}

      <button type="submit" disabled={loading} style={{
        padding: '10px 24px',
        background: 'var(--sage)',
        border: 'none',
        borderRadius: 'var(--radius)',
        color: 'var(--dark)',
        fontSize: '14px',
        fontWeight: '600',
        alignSelf: 'flex-end',
        opacity: loading ? 0.6 : 1,
      }}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}