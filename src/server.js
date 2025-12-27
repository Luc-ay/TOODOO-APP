import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import redisClient from './config/redis.js'
import authRouter from './routes/auth.routes.js'
import hirerRouter from './routes/hirer.profile.js'
import workerRoute from './routes/worker.route.js'
import bookingRouter from './routes/booking.routes.js'
import serviceRouter from './routes/service.routes.js'
import connectdb from './config/database.js'
import { fileURLToPath } from 'url'

dotenv.config()
async function startServer() {
  if (!redisClient.isOpen) {
    await redisClient.connect()
    console.log('✅ Redis connected')
  }
}

const app = express()
app.use(
  cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use(express.static('frontend'))
app.use(morgan('dev'))

app.use('/api/auth', authRouter)
app.use('/api/hirer', hirerRouter)
app.use('/api/worker', workerRoute)
app.use('/api/bookings', bookingRouter)
app.use('/api/services', serviceRouter)

app.use(express.static(path.join(__dirname, 'frontend')))
const PORT = process.env.PORT | 5000
await connectdb()
app.listen(PORT, async () => {
  console.log(`PORT is listening on http://localhost:${PORT}`)
})

startServer()
