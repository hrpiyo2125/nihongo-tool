// Simple in-memory sliding-window rate limiter (per serverless instance)
const buckets = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const timestamps = (buckets.get(key) ?? []).filter(t => now - t < windowMs)
  if (timestamps.length >= limit) return false
  timestamps.push(now)
  buckets.set(key, timestamps)
  return true
}
