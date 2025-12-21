import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    hirerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceType: String,
    jobDescription: String,
    address: String,
    date: Date,
    time: String,
    totalCost: Number,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
  },
  { timestamps: true }
)

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking
