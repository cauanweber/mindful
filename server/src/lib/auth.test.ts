import { describe, expect, it } from 'vitest'
import { comparePassword, hashPassword, signToken, verifyToken } from './auth'

describe('auth helpers', () => {
  it('faz hash e compara senha corretamente', async () => {
    const password = 'minhaSenha123'
    const hash = await hashPassword(password)

    await expect(comparePassword(password, hash)).resolves.toBe(true)
    await expect(comparePassword('senha-errada', hash)).resolves.toBe(false)
  })

  it('assina e valida token com sub do usuário', () => {
    const userId = 'user_123'
    const token = signToken(userId)
    const payload = verifyToken(token)

    expect(payload.sub).toBe(userId)
  })
})
