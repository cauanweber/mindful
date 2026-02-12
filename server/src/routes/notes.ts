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
    orderBy: { updatedAt: 'desc' },
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
    },
  })

  return res.status(201).json(note)
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
