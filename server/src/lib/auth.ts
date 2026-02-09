import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET || 'dev-secret'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  return jwt.verify(token, jwtSecret) as { sub: string }
}
