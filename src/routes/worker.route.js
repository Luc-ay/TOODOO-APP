import express from 'express'
import { authorizeRoles, verifyToken } from '../middleware/auth.js'
import {
  getWorkerProfile,
  updateWorkerProfile,
} from '../controllers/worker.controller.js'
import upload from '../config/multer.js'

const router = express.Router()

router.get('/profile', verifyToken, authorizeRoles('worker'), getWorkerProfile)
router.put(
  '/profile',
  verifyToken,
  authorizeRoles('worker'),
  upload.fields([
    { name: 'credentials', maxCount: 10 },
    { name: 'gallery', maxCount: 10 },
  ]),
  updateWorkerProfile
)

export default router
