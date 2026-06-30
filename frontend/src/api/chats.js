const PROMPTS_BASE = '/api/prompts'
const CHATS_BASE = '/api/chats'

export async function executePrompt(promptId, model = null) {
  const res = await fetch(`${PROMPTS_BASE}/${promptId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model ? { model } : {}),
  })
  if (!res.ok) throw new Error('Failed to execute prompt')
  return res.json()
}

export async function sendFollowUp(chatId, content, model = null) {
  const res = await fetch(`${CHATS_BASE}/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, ...(model ? { model } : {}) }),
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
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