import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../lib/auth'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header) {
    return res.status(401).json({ message: 'Token ausente.' })
  }

  const [type, token] = header.split(' ')
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token inválido.' })
  }

  try {
    const payload = verifyToken(token)
    req.userId = payload.sub
    return next()
  } catch {
    return res.status(401).json({ message: 'Token inválido.' })
  }
}
