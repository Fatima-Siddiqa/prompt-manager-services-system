import { useEffect, useState } from 'react'
import { fetchReviews } from '../api/reviews'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews().then(data => { setReviews(data); setLoading(false) })
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600' }}>Reviews</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} submitted
        </p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>loading...</div>
      ) : reviews.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          No reviews yet. Open a prompt to submit one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map(r => (
            <div key={r.id} style={{
              background: 'var(--dark-3)',
              border: '1px solid var(--dark-4)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{r.reviewer_name}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--sage)',
                }}>
                  {r.score}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/5</span>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{r.feedback}</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
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
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {new Date(r.reviewed_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}