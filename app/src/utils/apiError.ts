import { isAxiosError } from 'axios'

type ErrorPayload = {
  message?: string
  error?: string
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback

  const data = error.response?.data

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data && typeof data === 'object') {
    const payload = data as ErrorPayload
    if (payload.message && payload.message.trim()) return payload.message
    if (payload.error && payload.error.trim()) return payload.error
  }

  if (error.message.trim()) return error.message

  return fallback
}
