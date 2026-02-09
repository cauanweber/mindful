import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)

const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
