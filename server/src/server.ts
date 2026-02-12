import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import diaryRoutes from './routes/diary'
import tasksRoutes from './routes/tasks'
import notesRoutes from './routes/notes'
import weeklyGoalsRoutes from './routes/weekly-goals'
import { errorHandler, notFoundHandler } from './middleware/error'
import prisma from './lib/prisma'
import { createRateLimit } from './middleware/rateLimit'

const app = express()

const corsOriginEnv = process.env.CORS_ORIGIN?.trim()
const allowedOrigins = corsOriginEnv
  ? corsOriginEnv.split(',').map((origin) => origin.trim()).filter(Boolean)
  : []

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)

      if (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      const error = new Error('Origem não permitida pelo CORS') as Error & {
        statusCode?: number
      }
      error.statusCode = 403
      return callback(error)
    },
    credentials: true,
  }),
)
app.use(express.json())

const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  message: 'Muitas tentativas de autenticação. Tente novamente em alguns minutos.',
})

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'up' })
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down' })
  }
})

app.use('/api/auth', authRateLimit, authRoutes)
app.use('/api/diary', diaryRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/weekly-goals', weeklyGoalsRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
