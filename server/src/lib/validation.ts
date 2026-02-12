export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function nonEmptyString(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function optionalString(value: unknown) {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') return null
  return value.trim()
}

export function booleanOrUndefined(value: unknown) {
  return typeof value === 'boolean' ? value : undefined
}

export function parseDateString(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) return null
  if (value.some((item) => typeof item !== 'string' || !item.trim())) return null
  return value as string[]
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
