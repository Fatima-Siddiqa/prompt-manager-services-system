const BASE = '/api/reviews/'

export async function fetchReviews(promptId = '') {
  const params = new URLSearchParams()
  if (promptId) params.append('prompt_id', promptId)
  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error('Failed to fetch reviews')
  return res.json()
}

export async function fetchSummary(promptId) {
  const res = await fetch(`/api/reviews/${promptId}/summary`)
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
  const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete review')
}