import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import redisClient from './config/redis.js'
import authRouter from './routes/auth.routes.js'
import hirerRouter from './routes/hirer.profile.js'
import connectdb from './config/database.js'

dotenv.config()
async function startServer() {
  if (!redisClient.isOpen) {
    await redisClient.connect()
    console.log('✅ Redis connected')
  }
}

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/auth', authRouter)
app.use('/hirer', hirerRouter)

const PORT = process.env.PORT | 5000
await connectdb()
app.listen(PORT, async () => {
  console.log(`PORT is listening on http://localhost:${PORT}`)
})

startServer()
