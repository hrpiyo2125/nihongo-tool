type ErrorType = 'uncaught' | 'unhandled_rejection' | 'react_boundary' | 'manual'

export async function logError(params: {
  type: ErrorType
  message: string
  stack?: string
  url?: string
  userId?: string
}) {
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  } catch {
    // ログ送信失敗はサイレントに無視
  }
}
