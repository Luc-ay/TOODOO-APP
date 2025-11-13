import express from 'express'
import { authorizeRoles, verifyToken } from '../middleware/auth.js'
import {
  getWorkerProfile,
  updateWorkerProfile,
} from '../controllers/worker.controller.js'

const router = express.Router()

router.get('/', verifyToken, authorizeRoles('worker'), getWorkerProfile)
router.patch(
  '/profile',
  verifyToken,
  authorizeRoles('worker'),
  updateWorkerProfile
)

export default router
