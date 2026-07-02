const BASE = import.meta.env.VITE_FILES_API_URL

export async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE}/`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to upload file')
  }
  return res.json()
}

export async function getFileText(fileId) {
  const res = await fetch(`${BASE}/${fileId}/text`)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to extract text')
  }
  return res.json()
}

export async function deleteFile(fileId) {
  const res = await fetch(`${BASE}/${fileId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete file')
}