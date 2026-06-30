import { useEffect, useState } from 'react'
import { fetchPrompts } from '../api/prompts'
import { fetchReviews, fetchSummary, createReview, deleteReview } from '../api/reviews'
export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterPromptId, setFilterPromptId] = useState('')
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ prompt_id: '', reviewer_name: '', score: 3, feedback: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function loadReviews(promptId = '') {
    setLoading(true)
    try {
      const data = await fetchReviews({ promptId })
      setReviews(data)
    } finally {
      setLoading(false)
    }
  }

  async function loadSummary(promptId) {
    if (!promptId) { setSummary(null); return }
    setSummaryLoading(true)
    try {
      const s = await fetchSummary(promptId)
      setSummary(s)
    } catch {
      setSummary(null)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    fetchPrompts().then(setPrompts)
    loadReviews()
  }, [])

  useEffect(() => {
    loadReviews(filterPromptId)
    loadSummary(filterPromptId)
    setSelectedReview(null)
  }, [filterPromptId])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await createReview({ ...form, score: Number(form.score) })
      setShowForm(false)
      setForm({ prompt_id: '', reviewer_name: '', score: 3, feedback: '' })
      loadReviews(filterPromptId)
      if (filterPromptId) loadSummary(filterPromptId)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteReview(e, reviewId) {
    e.stopPropagation()
    if (!confirm('Delete this review?')) return
    await deleteReview(reviewId)
    loadReviews(filterPromptId)
    if (filterPromptId) loadSummary(filterPromptId)
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
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600' }}>Reviews</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            {filterPromptId ? ' for selected prompt' : ' total'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{
            padding: '9px 18px',
            background: showForm ? 'transparent' : 'var(--sage)',
            border: '1px solid',
            borderColor: showForm ? 'var(--dark-4)' : 'var(--sage)',
            borderRadius: 'var(--radius)',
            color: showForm ? 'var(--text-secondary)' : 'var(--dark)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ Submit Review'}
        </button>
      </div>

      {/* Submit Review Form — POST /reviews */}
      {showForm && (
        <div style={{
          background: 'var(--dark-3)',
          border: '1px solid var(--dark-4)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          marginBottom: '28px',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--sage)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>
            POST /reviews
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Prompt *</label>
              <select
                style={inputStyle}
                value={form.prompt_id}
                onChange={e => setForm(f => ({ ...f, prompt_id: e.target.value }))}
                required
              >
                <option value="">Select a prompt...</option>
                {prompts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

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
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, score: n }))}
                    style={{
                      width: '40px',
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

            <div>
              <label style={labelStyle}>Feedback *</label>
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                value={form.feedback}
                onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))}
                placeholder="Your written feedback..."
                required
              />
            </div>

            {error && (
              <div style={{ fontSize: '13px', color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
                ✕ {error}
              </div>
            )}

            <button type="submit" disabled={submitting} style={{
              padding: '10px 24px',
              background: 'var(--sage)',
              border: 'none',
              borderRadius: 'var(--radius)',
              color: 'var(--dark)',
              fontSize: '14px',
              fontWeight: '600',
              alignSelf: 'flex-end',
              cursor: 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Filter by prompt_id — GET /reviews?prompt_id= */}
      <div style={{ marginBottom: '20px' }}>
        <select
          style={{
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-4)',
            borderRadius: 'var(--radius)',
            padding: '8px 14px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            width: '280px',
          }}
          value={filterPromptId}
          onChange={e => setFilterPromptId(e.target.value)}
        >
          <option value="">All prompts</option>
          {prompts.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Summary — GET /reviews/{prompt_id}/summary */}
      {filterPromptId && (
        <div style={{
          background: 'var(--dark-3)',
          border: '1px solid var(--dark-4)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '24px',
        }}>
          {summaryLoading ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>loading summary...</div>
          ) : summary ? (
            <div style={{ display: 'flex', gap: '40px' }}>
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>AVG SCORE</div>
                <div style={{ fontSize: '32px', fontWeight: '600', color: 'var(--sage)', fontFamily: 'var(--font-mono)' }}>
                  {summary.average_score}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/5</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>TOTAL REVIEWS</div>
                <div style={{ fontSize: '32px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {summary.total_reviews}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No reviews yet for this prompt.
            </div>
          )}
        </div>
      )}

      {/* Reviews list — GET /reviews or GET /reviews?prompt_id= */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>loading...</div>
      ) : reviews.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          No reviews found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map(r => (
            <div
              key={r.id}
              onClick={() => setSelectedReview(selectedReview?.id === r.id ? null : r)}
              style={{
                background: selectedReview?.id === r.id ? 'var(--dark-4)' : 'var(--dark-3)',
                border: '1px solid',
                borderColor: selectedReview?.id === r.id ? 'var(--sage-dim)' : 'var(--dark-4)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{r.reviewer_name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: '600', color: 'var(--sage)' }}>
                    {r.score}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/5</span>
                  </div>
                  <button
                    onClick={e => handleDeleteReview(e, r.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '16px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(224,112,112,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{r.feedback}</div>

              {/* GET /reviews/{id} — show full details when clicked */}
              {selectedReview?.id === r.id && (
                <div style={{ borderTop: '1px solid var(--dark-4)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    prompt_id: {r.prompt_id}
                  </div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    reviewed_at: {new Date(r.reviewed_at).toLocaleString()}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    background: 'var(--dark-2)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    marginTop: '4px',
                  }}>
                    {r.prompt_snapshot}
                  </div>
                </div>
              )}

              {!selectedReview || selectedReview.id !== r.id ? (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  background: 'var(--dark-2)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {r.prompt_snapshot}
                </div>
              ) : null}

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {new Date(r.reviewed_at).toLocaleString()}
                <span style={{ marginLeft: '12px', opacity: 0.5 }}>click to {selectedReview?.id === r.id ? 'collapse' : 'expand'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}