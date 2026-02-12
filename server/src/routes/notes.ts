import { Router } from 'express'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

// GET /api/notes
router.get('/', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }
  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: [{ sortOrder: 'desc' }, { updatedAt: 'desc' }],
  })

  return res.json(notes)
})

// POST /api/notes
router.post('/', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }
  const { title, content } = req.body as { title?: string; content?: string }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Título obrigatório.' })
  }

  const note = await prisma.note.create({
    data: {
      userId,
      title: title.trim(),
      content: content?.trim() || '',
      sortOrder:
        ((await prisma.note.aggregate({
          where: { userId },
          _max: { sortOrder: true },
        }))._max.sortOrder ?? 0) + 1,
    },
  })

  return res.status(201).json(note)
})

// PUT /api/notes/reorder
router.put('/reorder', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }

  const { ids } = req.body as { ids?: string[] }
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Lista de IDs inválida.' })
  }

  const uniqueIds = Array.from(new Set(ids))
  if (uniqueIds.length !== ids.length) {
    return res.status(400).json({ message: 'IDs duplicados na ordenação.' })
  }

  const ownedCount = await prisma.note.count({
    where: { userId, id: { in: ids } },
  })
  if (ownedCount !== ids.length) {
    return res.status(400).json({ message: 'Uma ou mais notas são inválidas.' })
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.note.update({
        where: { id },
        data: { sortOrder: ids.length - index },
      }),
    ),
  )

  return res.status(204).send()
})

// PATCH /api/notes/:id
router.patch('/:id', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }

  const idParam = req.params.id
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  if (!id) {
    return res.status(400).json({ message: 'ID da nota inválido.' })
  }
  const { title, content } = req.body as { title?: string; content?: string }

  const existing = await prisma.note.findFirst({ where: { id, userId } })
  if (!existing) {
    return res.status(404).json({ message: 'Nota não encontrada.' })
  }

  const note = await prisma.note.update({
    where: { id },
    data: {
      title: title !== undefined ? title.trim() : existing.title,
      content: content !== undefined ? content.trim() : existing.content,
    },
  })

  return res.json(note)
})

// DELETE /api/notes/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido.' })
  }

  const idParam = req.params.id
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  if (!id) {
    return res.status(400).json({ message: 'ID da nota inválido.' })
  }

  const existing = await prisma.note.findFirst({ where: { id, userId } })
  if (!existing) {
    return res.status(404).json({ message: 'Nota não encontrada.' })
  }

  await prisma.note.delete({ where: { id } })
  return res.status(204).send()
})

export default router
