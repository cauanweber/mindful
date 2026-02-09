import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import diaryRoutes from './routes/diary'
import tasksRoutes from './routes/tasks'
import notesRoutes from './routes/notes'
import weeklyGoalsRoutes from './routes/weekly-goals'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/diary', diaryRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/weekly-goals', weeklyGoalsRoutes)

const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
