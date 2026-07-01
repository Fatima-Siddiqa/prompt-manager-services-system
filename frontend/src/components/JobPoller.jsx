import { useEffect, useState, useRef } from 'react'
import { pollJob } from '../api/chats'

const PROGRESS_MESSAGES = [
  'Thinking...',
  'Processing your request...',
  'Almost there...',
  'Finishing touches...',
  'Just a moment...',
  'Working on it...',
]

export default function JobPoller({ jobId, onDone, onError }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const intervalRef = useRef(null)
  const messageIntervalRef = useRef(null)

  useEffect(() => {
    if (!jobId) return

    // rotate progress messages every 2s
    messageIntervalRef.current = setInterval(() => {
      setMessageIndex(i => (i + 1) % PROGRESS_MESSAGES.length)
    }, 2000)

    // poll job status every 1.5s
    intervalRef.current = setInterval(async () => {
      try {
        const job = await pollJob(jobId)
        if (job.status === 'done') {
          clearInterval(intervalRef.current)
          clearInterval(messageIntervalRef.current)
          onDone(job.result)
        } else if (job.status === 'failed') {
          clearInterval(intervalRef.current)
          clearInterval(messageIntervalRef.current)
          onError(job.error || 'Job failed')
        }
      } catch (err) {
        clearInterval(intervalRef.current)
        clearInterval(messageIntervalRef.current)
        onError(err.message)
      }
    }, 1500)

    return () => {
      clearInterval(intervalRef.current)
      clearInterval(messageIntervalRef.current)
    }
  }, [jobId])

  if (!jobId) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: 'var(--dark-3)',
      border: '1px solid var(--dark-4)',
      borderRadius: 'var(--radius)',
      fontSize: '13px',
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'var(--sage)',
        animation: 'pulse 1.2s ease-in-out infinite',
      }} />
      {PROGRESS_MESSAGES[messageIndex]}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}