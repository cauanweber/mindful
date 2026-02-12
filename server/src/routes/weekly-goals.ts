import { Router } from 'express'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import {
  booleanOrUndefined,
  isRecord,
  nonEmptyString,
  parseDateString,
} from '../lib/validation'

const router = Router()

function getWeekStart(date = new Date()) {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

// GET /api/weekly-goals
router.get('/', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }

  const weekStartQuery = req.query.weekStart
  const weekStart = weekStartQuery ? parseDateString(weekStartQuery) : getWeekStart()
  if (!weekStart) {
    return res.status(400).json({ message: 'Data de início da semana inválida.' })
  }

  const goals = await prisma.weeklyGoal.findMany({
    where: { userId, weekStart },
    orderBy: { createdAt: 'desc' },
  })

  return res.json({ weekStart, goals })
})

// POST /api/weekly-goals
router.post('/', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }
  if (!isRecord(req.body)) {
    return res.status(400).json({ message: 'Payload inválido.' })
  }
  const title = nonEmptyString(req.body.title)
  const weekStartRaw = req.body.weekStart

  if (!title) {
    return res.status(400).json({ message: 'Título obrigatório.' })
  }

  const startDate = weekStartRaw ? parseDateString(weekStartRaw) : getWeekStart()
  if (!startDate) {
    return res.status(400).json({ message: 'Data de início da semana inválida.' })
  }

  const goal = await prisma.weeklyGoal.create({
    data: {
      userId,
      title,
      weekStart: startDate,
    },
  })

  return res.status(201).json(goal)
})

// PATCH /api/weekly-goals/:id
router.patch('/:id', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }

  const idParam = req.params.id
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  if (!id) {
    return res.status(400).json({ message: 'ID da meta inválido.' })
  }
  if (!isRecord(req.body)) {
    return res.status(400).json({ message: 'Payload inválido.' })
  }
  const titleRaw = req.body.title
  const done = booleanOrUndefined(req.body.done)

  const existing = await prisma.weeklyGoal.findFirst({ where: { id, userId } })
  if (!existing) {
    return res.status(404).json({ message: 'Meta não encontrada.' })
  }

  const title = titleRaw === undefined ? undefined : nonEmptyString(titleRaw)
  if (titleRaw !== undefined && !title) {
    return res.status(400).json({ message: 'Título obrigatório.' })
  }

  const goal = await prisma.weeklyGoal.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      done: done ?? existing.done,
    },
  })

  return res.json(goal)
})

// DELETE /api/weekly-goals/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }

  const idParam = req.params.id
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  if (!id) {
    return res.status(400).json({ message: 'ID da meta inválido.' })
  }

  const existing = await prisma.weeklyGoal.findFirst({ where: { id, userId } })
  if (!existing) {
    return res.status(404).json({ message: 'Meta não encontrada.' })
  }

  await prisma.weeklyGoal.delete({ where: { id } })
  return res.status(204).send()
})

export default router
