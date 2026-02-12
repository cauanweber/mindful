import { Router } from 'express'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

// GET /api/tasks
router.get('/', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return res.json(tasks)
})

// POST /api/tasks
router.post('/', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }
  const { title, dueDate, priority } = req.body as {
    title?: string
    dueDate?: string
    priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Título obrigatório.' })
  }

  const task = await prisma.task.create({
    data: {
      userId,
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'MEDIUM',
    },
  })

  return res.status(201).json(task)
})

// PATCH /api/tasks/:id
router.patch('/:id', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }

  const idParam = req.params.id
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  if (!id) {
    return res.status(400).json({ message: 'ID da tarefa inválido.' })
  }
  const { completed, title, dueDate, priority } = req.body as {
    completed?: boolean
    title?: string
    dueDate?: string | null
    priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  }

  const existing = await prisma.task.findFirst({ where: { id, userId } })
  if (!existing) {
    return res.status(404).json({ message: 'Tarefa não encontrada.' })
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      completed: typeof completed === 'boolean' ? completed : existing.completed,
      title: title !== undefined ? title.trim() : existing.title,
      dueDate:
        dueDate === null
          ? null
          : dueDate
            ? new Date(dueDate)
            : existing.dueDate,
      priority: priority || existing.priority,
    },
  })

  return res.json(task)
})

// DELETE /api/tasks/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }

  const idParam = req.params.id
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  if (!id) {
    return res.status(400).json({ message: 'ID da tarefa inválido.' })
  }

  const existing = await prisma.task.findFirst({ where: { id, userId } })
  if (!existing) {
    return res.status(404).json({ message: 'Tarefa não encontrada.' })
  }

  await prisma.task.delete({ where: { id } })
  return res.status(204).send()
})

export default router
