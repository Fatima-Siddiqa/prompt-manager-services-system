import { useState } from 'react'

const inputStyle = {
  width: '100%',
  background: 'var(--dark-2)',
  border: '1px solid var(--dark-4)',
  borderRadius: 'var(--radius)',
  padding: '10px 14px',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
  transition: 'var(--transition)',
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

export default function PromptForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    description: initial.description || '',
    content: initial.content || '',
    tags: initial.tags || '',
    model_target: initial.model_target || '',
  })

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <label style={labelStyle}>Name *</label>
        <input
          style={inputStyle}
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="e.g. Mythical Story Builder"
          required
          onFocus={e => e.target.style.borderColor = 'var(--sage)'}
          onBlur={e => e.target.style.borderColor = 'var(--dark-4)'}
        />
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <input
          style={inputStyle}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="One-line summary of what this prompt does"
          onFocus={e => e.target.style.borderColor = 'var(--sage)'}
          onBlur={e => e.target.style.borderColor = 'var(--dark-4)'}
        />
      </div>

      <div>
        <label style={labelStyle}>Content *</label>
        <textarea
          style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: '13px', minHeight: '160px', resize: 'vertical', lineHeight: '1.6' }}
          value={form.content}
          onChange={e => set('content', e.target.value)}
          placeholder="The actual prompt text sent to the LLM..."
          required
          onFocus={e => e.target.style.borderColor = 'var(--sage)'}
          onBlur={e => e.target.style.borderColor = 'var(--dark-4)'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Tags</label>
          <input
            style={inputStyle}
            value={form.tags}
            onChange={e => set('tags', e.target.value)}
            placeholder="creative,storytelling,chained"
            onFocus={e => e.target.style.borderColor = 'var(--sage)'}
            onBlur={e => e.target.style.borderColor = 'var(--dark-4)'}
          />
        </div>
        <div>
          <label style={labelStyle}>Model Target</label>
          <input
            style={inputStyle}
            value={form.model_target}
            onChange={e => set('model_target', e.target.value)}
            placeholder="gpt-4o, claude-opus-4-6..."
            onFocus={e => e.target.style.borderColor = 'var(--sage)'}
            onBlur={e => e.target.style.borderColor = 'var(--dark-4)'}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{
            padding: '10px 20px',
            background: 'transparent',
            border: '1px solid var(--dark-4)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)',
            fontSize: '14px',
          }}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading} style={{
          padding: '10px 24px',
          background: 'var(--sage)',
          border: 'none',
          borderRadius: 'var(--radius)',
          color: 'var(--dark)',
          fontSize: '14px',
          fontWeight: '600',
          opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Saving...' : 'Save Prompt'}
        </button>
      </div>
    </form>
  )
}