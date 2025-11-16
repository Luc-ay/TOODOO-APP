import express from 'express'
import { authorizeRoles, verifyToken } from '../middleware/auth.js'
import upload from '../config/multer.js'
import {
  changePWD,
  getUserProfile,
  updateUserProfile,
} from '../controllers/hirer.controller.js'

const router = express.Router()

router.get('/', verifyToken, authorizeRoles('hirer'), getUserProfile)
router.put(
  '/update',
  verifyToken,
  authorizeRoles('hirer'),
  upload.single('profilePic'),
  updateUserProfile
)
router.put('/change-pwd', verifyToken, authorizeRoles('hirer'), changePWD)

export default router
