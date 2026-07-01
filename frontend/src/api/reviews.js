const BASE = import.meta.env.VITE_REVIEWS_API_URL

export async function fetchReviews({ promptId = '', chatId = '' } = {}) {
  const params = new URLSearchParams()
  if (promptId) params.append('prompt_id', promptId)
  if (chatId) params.append('chat_id', chatId)
  const res = await fetch(`${BASE}/?${params}`)
  if (!res.ok) throw new Error('Failed to fetch reviews')
  return res.json()
}

export async function fetchSummary(promptId) {
  const res = await fetch(`${BASE}/${promptId}/summary`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('No reviews found')
  return res.json()
}

export async function fetchChatSummary(chatId) {
  const res = await fetch(`${BASE}/chat/${chatId}/summary`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('No reviews found')
  return res.json()
}

export async function createReview(data) {
  const res = await fetch(BASE + '/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to submit review')
  return res.json()
}

export async function deleteReview(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete review')
}