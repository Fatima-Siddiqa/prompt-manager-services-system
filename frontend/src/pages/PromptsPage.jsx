import { useEffect, useState } from 'react'
import { fetchPrompts, createPrompt } from '../api/prompts'
import PromptCard from '../components/PromptCard'
import PromptForm from '../components/PromptForm'

export default function PromptsPage() {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tag, setTag] = useState('')
  const [limit, setLimit] = useState(100)

  async function load() {
    setLoading(true)
    try {
      const data = await fetchPrompts(tag, limit)
      setPrompts(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [tag, limit])

  async function handleCreate(form) {
    setSaving(true)
    try {
      await createPrompt(form)
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    background: 'var(--dark-2)',
    border: '1px solid var(--dark-4)',
    borderRadius: 'var(--radius)',
    padding: '8px 14px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-primary)' }}>Prompts</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} stored
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
          {showForm ? 'Cancel' : '+ New Prompt'}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--dark-3)',
          border: '1px solid var(--dark-4)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          marginBottom: '32px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '24px', color: 'var(--sage)' }}>
            New Prompt
          </h2>
          <PromptForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          value={tag}
          onChange={e => setTag(e.target.value)}
          placeholder="Filter by tag..."
          style={{ ...inputStyle, width: '200px' }}
        />
        <select
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          style={{ ...inputStyle, width: '140px' }}
        >
          <option value={10}>limit: 10</option>
          <option value={25}>limit: 25</option>
          <option value={50}>limit: 50</option>
          <option value={100}>limit: 100</option>
        </select>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          loading prompts...
        </div>
      ) : prompts.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          No prompts found. Create one above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {prompts.map(p => (
            <PromptCard key={p.id} prompt={p} onDeleted={load} onUpdated={load} />
          ))}
        </div>
      )}
    </div>
  )
}