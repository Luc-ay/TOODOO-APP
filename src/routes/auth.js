import express from 'express'

import {
  hirer_register,
  login,
  verifyCode,
  worker_register,
} from '../controllers/auth.js'

const router = express.Router()

router.post('/register-hirer', hirer_register)
router.post('/register-worker', worker_register)
router.post('/login', login)
router.post('/verify-user', verifyCode)
export default router
