import express from 'express'
import dotenv from 'dotenv'
import morgan, { format } from 'morgan'
import router from './routes/auth.js'
import connectdb from './config/database.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/auth', router)

const PORT = process.env.PORT | 5000

app.listen(PORT, async () => {
  await connectdb()
  console.log(`PORT is listening on http://localhost:${PORT}`)
})
