const CHATS_BASE = import.meta.env.VITE_CHATS_API_URL
const PROMPTS_BASE = import.meta.env.VITE_PROMPTS_API_URL
const JOBS_BASE = import.meta.env.VITE_JOBS_API_URL

export async function executePrompt(promptId, model = null) {
  const res = await fetch(`${PROMPTS_BASE}/${promptId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model ? { model } : {}),
  })
  if (!res.ok) throw new Error('Failed to execute prompt')
  return res.json() // returns { job_id, status: "pending" }
}

export async function sendFollowUp(chatId, content, model = null) {
  const res = await fetch(`${CHATS_BASE}/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, ...(model ? { model } : {}) }),
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json() // returns { job_id, status: "pending" }
}

export async function pollJob(jobId) {
  const res = await fetch(`${JOBS_BASE}/${jobId}`)
  if (!res.ok) throw new Error('Failed to poll job')
  return res.json() // returns { job_id, status, result, error }
}

export async function fetchChats(promptId = '') {
  const params = new URLSearchParams()
  if (promptId) params.append('prompt_id', promptId)
  const res = await fetch(`${CHATS_BASE}?${params}`)
  if (!res.ok) throw new Error('Failed to fetch chats')
  return res.json()
}

export async function fetchChat(chatId) {
  const res = await fetch(`${CHATS_BASE}/${chatId}`)
  if (!res.ok) throw new Error('Chat not found')
  return res.json()
}

export async function summarizeChat(chatId) {
  const res = await fetch(`${CHATS_BASE}/${chatId}/summary`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to summarize chat')
  return res.json()
}

export async function deleteChat(chatId) {
  const res = await fetch(`${CHATS_BASE}/${chatId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete chat')
}