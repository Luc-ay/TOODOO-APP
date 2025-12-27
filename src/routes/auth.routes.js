import express from 'express'

import {
  changePassword,
  checktoken,
  passwordOTP,
  register,
  login,
  verifyPasswordCode,
  verifyOtp,
} from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/verify-otp', verifyOtp)
router.post('/forgot-password', passwordOTP)
router.post('/reset-password', changePassword)
router.post('/verify-passcode', verifyPasswordCode)
export default router
