import { useState } from 'react'
import { uploadFile, getFileText, deleteFile } from '../api/files'

export default function DocumentUpload({ onDocumentReady, onDocumentCleared }) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [error, setError] = useState('')

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const uploaded = await uploadFile(file)
      const textData = await getFileText(uploaded.id)

      setUploadedFile({
        id: uploaded.id,
        filename: uploaded.filename,
        estimatedTokens: textData.estimated_tokens,
        truncated: textData.truncated,
        text: textData.text,
      })

      onDocumentReady(textData.text, uploaded.filename)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleClear() {
    if (uploadedFile) {
      try {
        await deleteFile(uploadedFile.id)
      } catch {
        // best effort — don't block UI
      }
      setUploadedFile(null)
      onDocumentCleared()
    }
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      {!uploadedFile ? (
        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 14px',
          background: 'transparent',
          border: '1px dashed var(--dark-4)',
          borderRadius: 'var(--radius)',
          color: 'var(--text-muted)',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          cursor: uploading ? 'wait' : 'pointer',
          opacity: uploading ? 0.6 : 1,
        }}>
          <span>📎</span>
          {uploading ? 'Extracting text...' : 'Attach document (PDF or Word)'}
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </label>
      ) : (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '7px 14px',
          background: 'rgba(186,216,182,0.08)',
          border: '1px solid var(--sage)',
          borderRadius: 'var(--radius)',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
        }}>
          <span>📄</span>
          <div>
            <span style={{ color: 'var(--sage)' }}>{uploadedFile.filename}</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
              ~{uploadedFile.estimatedTokens} tokens
              {uploadedFile.truncated && ' (truncated)'}
            </span>
          </div>
          <button
            onClick={handleClear}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '6px',
          fontSize: '12px',
          color: 'var(--danger)',
          fontFamily: 'var(--font-mono)',
        }}>
          ✕ {error}
        </div>
      )}
    </div>
  )
}