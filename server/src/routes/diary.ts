import { Router } from "express"
import prisma from "../lib/prisma"
import { requireAuth } from "../middleware/auth"
import { isRecord, nonEmptyString } from "../lib/validation"

const router = Router()

router.get("/today", requireAuth, async(req, res) => {
    const userId = req.userId
    if (!userId) {
        return res.status(401).json({ message: "Token inválido." })
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const entry = await prisma.diaryEntry.findUnique({
        where: { userId_date: { userId, date: today }}
    })

    return res.json(entry)
})

router.put("/today", requireAuth, async(req, res) => {
    const userId = req.userId
    if (!userId) {
        return res.status(401).json({ message: "Token inválido." })
    }

    if (!isRecord(req.body)) {
        return res.status(400).json({ message: "Payload inválido." })
    }

    const content = nonEmptyString(req.body.content)

    if(!content)
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
