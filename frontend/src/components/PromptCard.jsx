import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deletePrompt, updatePrompt } from '../api/prompts'
import PromptForm from './PromptForm'
import { executePrompt } from '../api/chats'
import JobPoller from './JobPoller'
import DocumentUpload from './DocumentUpload'

export default function PromptCard({ prompt, onDeleted, onUpdated }) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [documentText, setDocumentText] = useState(null)

  async function handleDelete(e) {
    e.stopPropagation()
    if (!confirm(`Delete "${prompt.name}"?`)) return
    await deletePrompt(prompt.id)
    onDeleted()
  }

  async function handleUpdate(form) {
    setSaving(true)
    try {
      await updatePrompt(prompt.id, form)
      setEditing(false)
      onUpdated()
    } finally {
      setSaving(false)
    }
  }

  const [activeJobId, setActiveJobId] = useState(null)

  async function handleExecute(e) {
    e.stopPropagation()
    setExecuting(true)
    try {
      const job = await executePrompt(prompt.id, null, documentText)
      setActiveJobId(job.job_id)
    } catch (err) {
      alert(err.message)
      setExecuting(false)
    }
  }

  function handleJobDone(result) {
    setActiveJobId(null)
    setExecuting(false)
    navigate(`/chats/${result.id}`)
  }

  function handleJobError(err) {
    setActiveJobId(null)
    setExecuting(false)
    alert(err)
  }

  const tags = prompt.tags ? prompt.tags.split(',') : []

  return (
    <div style={{
      background: 'var(--dark-3)',
      border: '1px solid var(--dark-4)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div
          onClick={() => !editing && navigate(`/prompts/${prompt.id}`)}
          style={{ cursor: editing ? 'default' : 'pointer', flex: 1 }}
        >
          <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {prompt.name}
          </div>
          {prompt.description && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {prompt.description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
          <button
            onClick={e => { e.stopPropagation(); setEditing(s => !s) }}
            style={{
              background: 'transparent',
              border: '1px solid var(--dark-4)',
              color: editing ? 'var(--sage)' : 'var(--text-muted)',
              fontSize: '12px',
              padding: '3px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {editing ? 'cancel' : 'edit'}
          </button>

          <button
            onClick={handleExecute}
            disabled={executing}
            style={{
              background: 'var(--sage)',
              border: 'none',
              color: 'var(--dark)',
              fontSize: '12px',
              fontWeight: '600',
              padding: '3px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: executing ? 0.6 : 1,
            }}
          >
            {executing ? '...' : 'Execute'}
          </button>

          <button
            onClick={handleDelete}
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
      {/* Document upload — sits below header, above content */}
      {!editing && (
        <DocumentUpload
          onDocumentReady={(text) => setDocumentText(text)}
          onDocumentCleared={() => setDocumentText(null)}
        />
      )}

      {editing ? (
        <div style={{ borderTop: '1px solid var(--dark-4)', paddingTop: '16px' }}>
          <PromptForm
            initial={prompt}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            loading={saving}
          />
        </div>
      ) : (
        <>
          <div
            onClick={() => navigate(`/prompts/${prompt.id}`)}
            style={{
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
              cursor: 'pointer',
            }}
          >
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
        </>
      )}
      {activeJobId && (
        <JobPoller
          jobId={activeJobId}
          onDone={handleJobDone}
          onError={handleJobError}
        />
      )}
    </div>
  )
}