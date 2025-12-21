import express from 'express'
import {
  createBooking,
  getHirerBookings,
  getWorkerBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookingController.js'
import { authorizeRoles, verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/', verifyToken, authorizeRoles('hirer'), createBooking)
router.get('/hirer', verifyToken, authorizeRoles('hirer'), getHirerBookings)
router.get('/worker', verifyToken, authorizeRoles('worker'), getWorkerBookings)
router.get('/:id', verifyToken, getBookingById)
router.patch(
  '/:id/status',
  verifyToken,
  authorizeRoles('worker'),
  updateBookingStatus
)
router.patch('/:id/cancel', verifyToken, authorizeRoles('hirer'), cancelBooking)

export default router
