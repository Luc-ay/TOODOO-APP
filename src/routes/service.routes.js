import express from 'express'
import {
  getServices,
  getServiceById,
  getServiceProviders,
  getProviderById,
  getProviderReviews,
  createReview,
  getProviders,
} from '../controllers/serviceController.js'
import { authorizeRoles, verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getServices)
router.get('/:id', getServiceById)
router.get('/:id/providers', getServiceProviders)
router.get('/provider/:id', getProviderById)
router.get('/provider/:id/reviews', getProviderReviews)
router.post('/provider/:id/reviews', verifyToken, createReview)
router.get('/providers', getProviders)

export default router
