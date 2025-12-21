import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
  },
  { timestamps: true }
)

const Review = mongoose.model('Review', reviewSchema)

export default Review
