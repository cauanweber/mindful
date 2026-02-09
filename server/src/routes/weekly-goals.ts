import { Router } from 'express'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

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
  const userId = req.userId!
  const weekStart = req.query.weekStart
    ? new Date(String(req.query.weekStart))
    : getWeekStart()

  const goals = await prisma.weeklyGoal.findMany({
    where: { userId, weekStart },
    orderBy: { createdAt: 'desc' },
  })

  return res.json({ weekStart, goals })
})

// POST /api/weekly-goals
router.post('/', requireAuth, async (req, res) => {
  const userId = req.userId!
  const { title, weekStart } = req.body as {
    title?: string
    weekStart?: string
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Título obrigatório.' })
  }

  const startDate = weekStart ? new Date(weekStart) : getWeekStart()

  const goal = await prisma.weeklyGoal.create({
    data: {
      userId,
      title: title.trim(),
      weekStart: startDate,
    },
  })

  return res.status(201).json(goal)
})

// PATCH /api/weekly-goals/:id
router.patch('/:id', requireAuth, async (req, res) => {
  const userId = req.userId!
  const { id } = req.params
  const { title, done } = req.body as { title?: string; done?: boolean }

  const existing = await prisma.weeklyGoal.findFirst({ where: { id, userId } })
  if (!existing) {
    return res.status(404).json({ message: 'Meta não encontrada.' })
  }

  const goal = await prisma.weeklyGoal.update({
    where: { id },
    data: {
      title: title !== undefined ? title.trim() : existing.title,
      done: typeof done === 'boolean' ? done : existing.done,
    },
  })

  return res.json(goal)
})

// DELETE /api/weekly-goals/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const userId = req.userId!
  const { id } = req.params

  const existing = await prisma.weeklyGoal.findFirst({ where: { id, userId } })
  if (!existing) {
    return res.status(404).json({ message: 'Meta não encontrada.' })
  }

  await prisma.weeklyGoal.delete({ where: { id } })
  return res.status(204).send()
})

export default router
