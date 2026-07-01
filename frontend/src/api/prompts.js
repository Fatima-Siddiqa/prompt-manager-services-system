const BASE = import.meta.env.VITE_PROMPTS_API_URL

export async function fetchPrompts(tag = '', limit = 100) {
  const params = new URLSearchParams()
  if (tag) params.append('tag', tag)
  if (limit) params.append('limit', limit)
  const res = await fetch(`${BASE}/?${params}`)
  if (!res.ok) throw new Error('Failed to fetch prompts')
  return res.json()
}

export async function fetchPrompt(id) {
  const res = await fetch(`${BASE}/${id}`)
  if (!res.ok) throw new Error('Prompt not found')
  return res.json()
}

export async function createPrompt(data) {
  const res = await fetch(BASE + '/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create prompt')
  return res.json()
}

export async function updatePrompt(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update prompt')
  return res.json()
}

export async function deletePrompt(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete prompt')
}