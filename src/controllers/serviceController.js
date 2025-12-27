import Service from '../models/Service.js'
import WorkerProfile from './../models/Worker.Profile.js'
import Review from '../models/Review.js'
import Booking from '../models/Bookings.js'

export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 })
    res.status(200).json(services)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getServiceProviders = async (req, res) => {
  try {
    const providers = await WorkerProfile.find({
      serviceId: req.params.id,
    })
      .populate('userId', 'fullName phone profilePic')
      .sort({ rating: -1 })

    res.status(200).json(providers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProviders = async (req, res) => {
  try {
    const { serviceId, minRating = 0 } = req.query

    const query = {
      rating: { $gte: minRating },
    }

    if (serviceId) query.serviceId = serviceId

    const providers = await WorkerProfile.find(query)
      .populate('userId', 'fullName profilePic')
      .sort({ rating: -1 })

    res.status(200).json(providers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProviderById = async (req, res) => {
  try {
    const provider = await WorkerProfile.findById(req.params.id)
      .populate('userId', 'fullName phone profilePic')
      .populate('serviceId', 'name')

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' })
    }

    res.status(200).json(provider)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      workerId: req.params.id,
    })
      .populate('reviewerId', 'fullName profilePic')
      .sort({ createdAt: -1 })

    res.status(200).json(reviews)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createReview = async (req, res) => {
  try {
    const { rating, comment, bookingId } = req.body

    const booking = await Booking.findOne({
      _id: bookingId,
      hirerId: req.user.id,
      status: 'completed',
    })

    if (!booking) {
      return res.status(400).json({
        message: 'You can only review completed bookings',
      })
    }

    const review = await Review.create({
      workerId: req.params.id,
      reviewerId: req.user.id,
      bookingId,
      rating,
      comment,
    })

    res.status(201).json(review)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
