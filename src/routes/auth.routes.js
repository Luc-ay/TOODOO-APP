import express from 'express'

import {
  changePassword,
  checktoken,
  passwordOTP,
  hirer_register,
  login,
  verifyPasswordCode,
  verifyOtp,
  worker_register,
} from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', hirer_register)
router.post('/login', login)
router.post('/otp/verify', verifyOtp)
router.post('/forget-password', passwordOTP)
router.post('/change-password', changePassword)
router.post('/verify-passcode', verifyPasswordCode)
router.get('/verify', verifyToken, checktoken)
export default router
