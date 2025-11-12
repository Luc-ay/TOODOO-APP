import express from 'express'
import { authorizeRoles, verifyToken } from '../middleware/auth.js'
import {
  getUserProfile,
  updateUserProfile,
} from '../controllers/hirer.controller.js'

const router = express.Router()

router.get('/', verifyToken, authorizeRoles('hirer'), getUserProfile)
router.put('/update', verifyToken, authorizeRoles('hirer'), updateUserProfile)

export default router
