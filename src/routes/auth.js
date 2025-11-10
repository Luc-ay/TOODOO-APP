import express from 'express'

import {
  changePassword,
  checktoken,
  forgetPassword,
  hirer_register,
  login,
  verifyPasswordCode,
  verifyUser,
  worker_register,
} from '../controllers/auth.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/register-hirer', hirer_register)
router.post('/register-worker', worker_register)
router.post('/login', login)
router.post('/verify-user', verifyUser)
router.post('/forget-password', forgetPassword)
router.post('/change-password', changePassword)
router.post('/verify-passcode', verifyPasswordCode)
router.get('/verify', verifyToken, checktoken)
export default router
