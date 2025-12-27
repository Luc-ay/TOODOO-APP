import express from 'express'
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  getBookingReview,
  cancelBooking,
} from '../controllers/bookingController.js'
import { authorizeRoles, verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/', verifyToken, authorizeRoles('hirer'), createBooking)
router.get(
  '/my-bookings',
  verifyToken,
  authorizeRoles('hirer', 'worker'),
  getMyBookings
)
router.get('/:id', verifyToken, getBookingById)
router.patch(
  '/:id/status',
  verifyToken,
  authorizeRoles('worker'),
  updateBookingStatus
)
router.patch('/:id/cancel', verifyToken, authorizeRoles('hirer'), cancelBooking)
router.get('/:id/review', verifyToken, getBookingReview)

export default router
