import { Router } from 'express'
import prisma from '../lib/prisma'
import { comparePassword, hashPassword, signToken } from '../lib/auth'
import { requireAuth } from '../middleware/auth'
import { isRecord, isValidEmail, nonEmptyString } from '../lib/validation'

const router = Router()

router.post('/register', async (req, res) => {
  if (!isRecord(req.body)) {
    return res.status(400).json({ message: 'Payload inválido.' })
  }

  const name = nonEmptyString(req.body.name)
  const email = nonEmptyString(req.body.email)?.toLowerCase()
  const password = nonEmptyString(req.body.password)

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos.' })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'E-mail inválido.' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Senha deve ter ao menos 6 caracteres.' })
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return res.status(409).json({ message: 'E-mail já cadastrado.' })
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  })

  const token = signToken(user.id)

  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  })
})

router.post('/login', async (req, res) => {
  if (!isRecord(req.body)) {
    return res.status(400).json({ message: 'Payload inválido.' })
  }

  const email = nonEmptyString(req.body.email)?.toLowerCase()
  const password = nonEmptyString(req.body.password)

  if (!email || !password) {
    return res.status(400).json({ message: 'Preencha e-mail e senha.' })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'E-mail inválido.' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas.' })
  }

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ message: 'Credenciais inválidas.' })
  }

  const token = signToken(user.id)

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  })
})

router.get('/me', requireAuth, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' })
  }

  return res.json({ id: user.id, name: user.name, email: user.email })
})

export default router
