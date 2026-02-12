import type { NextFunction, Request, Response } from 'express'

type RateLimitConfig = {
  windowMs: number
  maxRequests: number
  message: string
}

type Entry = {
  count: number
  resetAt: number
}

export function createRateLimit(config: RateLimitConfig) {
  const requests = new Map<string, Entry>()

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now()
    const key = req.ip || 'unknown'
    const current = requests.get(key)

    if (!current || now >= current.resetAt) {
      requests.set(key, { count: 1, resetAt: now + config.windowMs })
      return next()
    }

    current.count += 1
    if (current.count > config.maxRequests) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000)
      res.setHeader('Retry-After', String(retryAfterSeconds))
      return res.status(429).json({ message: config.message })
    }

    requests.set(key, current)
    return next()
  }
}
