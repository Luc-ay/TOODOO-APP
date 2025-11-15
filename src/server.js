import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import redisClient from './config/redis.js'
import authRouter from './routes/auth.routes.js'
import hirerRouter from './routes/hirer.profile.js'
import workerRoute from './routes/worker.route.js'
import connectdb from './config/database.js'

dotenv.config()
async function startServer() {
  if (!redisClient.isOpen) {
    await redisClient.connect()
    console.log('✅ Redis connected')
  }
}

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static('frontend'))
app.use(morgan('dev'))

app.use('/auth', authRouter)
app.use('/hirer', hirerRouter)
app.use('/worker', workerRoute)

const PORT = process.env.PORT | 5000
await connectdb()
app.listen(PORT, async () => {
  console.log(`PORT is listening on http://localhost:${PORT}`)
})

startServer()
