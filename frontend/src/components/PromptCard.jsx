import { useNavigate } from 'react-router-dom'
import { deletePrompt } from '../api/prompts'

export default function PromptCard({ prompt, onDeleted }) {
  const navigate = useNavigate()

  async function handleDelete(e) {
    e.stopPropagation()
    if (!confirm(`Delete "${prompt.name}"?`)) return
    await deletePrompt(prompt.id)
    onDeleted()
  }

  const tags = prompt.tags ? prompt.tags.split(',') : []

  return (
    <div
      onClick={() => navigate(`/prompts/${prompt.id}`)}
      style={{
        background: 'var(--dark-3)',
        border: '1px solid var(--dark-4)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--sage-dim)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--dark-4)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {prompt.name}
          </div>
          {prompt.description && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {prompt.description}
            </div>
          )}
        </div>
        <button
          onClick={handleDelete}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '16px',
            padding: '2px 6px',
            borderRadius: '4px',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(224,112,112,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          ✕
        </button>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        background: 'var(--dark-2)',
        borderRadius: '6px',
        padding: '10px 14px',
        lineHeight: '1.5',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {prompt.content}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {tags.map(tag => (
          <span key={tag} style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            background: 'rgba(186,216,182,0.12)',
            color: 'var(--sage)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}>
            {tag.trim()}
          </span>
        ))}
        {prompt.model_target && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}>
            {prompt.model_target}
          </span>
        )}
      </div>
    </div>
  )
}