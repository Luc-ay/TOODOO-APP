import express from 'express'

import { hirer_register, login, worker_register } from '../controllers/auth.js'

const router = express.Router()

router.post('/register-hirer', hirer_register)
router.post('/register-worker', worker_register)
router.post('/login', login)

export default router
