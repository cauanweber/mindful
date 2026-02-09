import { Router } from "express"
import prisma from "../lib/prisma"
import { requireAuth } from "../middleware/auth"

const router = Router()

router.get("/today", requireAuth, async(req, res) => {
    const userId = req.userId!
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const entry = await prisma.diaryEntry.findUnique({
        where: { userId_date: { userId, date: today }}
    })

    return res.json(entry)
})

router.put("/today", requireAuth, async(req, res) => {
    const userId = req.userId!
    const { content }  = req.body as { content?: string }

    if(!content || !content.trim())
    {
        return res.status(400).json({ message: "Conteúdo obrigatório." })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const entry = await prisma.diaryEntry.upsert({
        where: { userId_date: { userId, date: today } },
        update: { content },
        create: { userId, date: today, content }
    })

    return res.json(entry)
})

export default router

