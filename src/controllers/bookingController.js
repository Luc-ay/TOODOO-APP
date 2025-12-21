import Booking from '../models/Bookings.js'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'

export const createBooking = async (req, res) => {
  try {
    const {
      workerId,
      serviceType,
      jobDescription,
      address,
      date,
      time,
      totalCost,
    } = req.body

    const hirer = await User.findById(req.user.id)

    if (!hirer) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (hirer.walletBalance < totalCost) {
      return res.status(400).json({
        message: 'Insufficient wallet balance',
      })
    }

    hirer.walletBalance -= totalCost
    await hirer.save()

    const booking = await Booking.create({
      hirerId: req.user.id,
      workerId,
      serviceType,
      jobDescription,
      address,
      date,
      time,
      totalCost,
      escrowAmount: totalCost,
      paymentStatus: 'paid',
    })

    await Transaction.create({
      userId: hirer._id,
      type: 'payment',
      amount: totalCost,
      status: 'completed',
    })

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getHirerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ hirerId: req.user.id })
      .populate('workerId', 'fullName email phone')
      .sort({ createdAt: -1 })

    res.status(200).json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getWorkerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ workerId: req.user.id })
      .populate('hirerId', 'fullName email phone')
      .sort({ createdAt: -1 })

    res.status(200).json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hirerId', 'fullName phone')
      .populate('workerId', 'fullName phone')

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    res.status(200).json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body

    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    booking.status = status
    await booking.save()

    res.status(200).json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (booking.status === 'completed') {
      return res
        .status(400)
        .json({ message: 'Completed booking cannot be cancelled' })
    }

    const hirer = await User.findById(booking.hirerId)

    let refundAmount = booking.escrowAmount

    if (booking.status === 'in-progress') {
      const cancellationFee = booking.escrowAmount * 0.1 // 10%
      refundAmount -= cancellationFee
    }

    //Refund hirer
    hirer.walletBalance += refundAmount
    await hirer.save()

    //Log refund transaction
    await Transaction.create({
      userId: hirer._id,
      type: 'refund',
      amount: refundAmount,
      status: 'completed',
    })

    //Update booking
    booking.status = 'cancelled'
    booking.escrowAmount = 0
    await booking.save()

    res.status(200).json({
      message: 'Booking cancelled successfully',
      refundedAmount: refundAmount,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
