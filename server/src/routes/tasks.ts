import { Router } from 'express'
import type { TaskPriority } from '@prisma/client'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import {
  booleanOrUndefined,
  isRecord,
  nonEmptyString,
  parseDateString,
  parseStringArray,
} from '../lib/validation'

const router = Router()

// GET /api/tasks
router.get('/', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
  })

  return res.json(tasks)
})

// POST /api/tasks
router.post('/', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }
  if (!isRecord(req.body)) {
    return res.status(400).json({ message: 'Payload inválido.' })
  }

  const title = nonEmptyString(req.body.title)
  const dueDateRaw = req.body.dueDate
  const priority = req.body.priority

  if (!title) {
    return res.status(400).json({ message: 'Título obrigatório.' })
  }

  const dueDate =
    dueDateRaw === undefined || dueDateRaw === null ? null : parseDateString(dueDateRaw)
  if (dueDateRaw !== undefined && dueDateRaw !== null && !dueDate) {
    return res.status(400).json({ message: 'Data de vencimento inválida.' })
  }

  const allowedPriorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH']
  const normalizedPriority =
    typeof priority === 'string' &&
    allowedPriorities.includes(priority as TaskPriority)
      ? (priority as TaskPriority)
      : 'MEDIUM'

  const task = await prisma.task.create({
    data: {
      userId,
      title,
      dueDate,
      priority: normalizedPriority,
      sortOrder:
        ((await prisma.task.aggregate({
          where: { userId },
          _max: { sortOrder: true },
        }))._max.sortOrder ?? 0) + 1,
    },
  })

  return res.status(201).json(task)
})

// PUT /api/tasks/reorder
router.put('/reorder', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }

  if (!isRecord(req.body)) {
    return res.status(400).json({ message: 'Payload inválido.' })
  }

  const ids = parseStringArray(req.body.ids)
  if (!ids || ids.length === 0) {
    return res.status(400).json({ message: 'Lista de IDs inválida.' })
  }

  const uniqueIds = Array.from(new Set(ids))
  if (uniqueIds.length !== ids.length) {
    return res.status(400).json({ message: 'IDs duplicados na ordenação.' })
  }

  const ownedCount = await prisma.task.count({
    where: { userId, id: { in: ids } },
  })
  if (ownedCount !== ids.length) {
    return res.status(400).json({ message: 'Uma ou mais tarefas são inválidas.' })
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.task.update({
        where: { id },
        data: { sortOrder: ids.length - index },
      }),
    ),
  )

  return res.status(204).send()
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
  if (!isRecord(req.body)) {
    return res.status(400).json({ message: 'Payload inválido.' })
  }
  const completed = booleanOrUndefined(req.body.completed)
  const titleRaw = req.body.title
  const dueDateRaw = req.body.dueDate
  const priorityRaw = req.body.priority

  const existing = await prisma.task.findFirst({ where: { id, userId } })
  if (!existing) {
    return res.status(404).json({ message: 'Tarefa não encontrada.' })
  }

  const parsedTitle =
    titleRaw === undefined ? undefined : nonEmptyString(titleRaw)
  if (titleRaw !== undefined && !parsedTitle) {
    return res.status(400).json({ message: 'Título obrigatório.' })
  }

  let parsedDueDate: Date | null | undefined
  if (dueDateRaw === null) {
    parsedDueDate = null
  } else if (dueDateRaw === undefined) {
    parsedDueDate = undefined
  } else {
    parsedDueDate = parseDateString(dueDateRaw)
    if (!parsedDueDate) {
      return res.status(400).json({ message: 'Data de vencimento inválida.' })
    }
  }

  const allowedPriorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH']
  const normalizedPriority =
    typeof priorityRaw === 'string' &&
    allowedPriorities.includes(priorityRaw as TaskPriority)
      ? (priorityRaw as TaskPriority)
      : undefined

  const task = await prisma.task.update({
    where: { id },
    data: {
      completed: completed ?? existing.completed,
      title: parsedTitle ?? existing.title,
      dueDate: parsedDueDate === undefined ? existing.dueDate : parsedDueDate,
      priority: normalizedPriority ?? existing.priority,
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
