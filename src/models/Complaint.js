import mongoose from 'mongoose'

const complaintSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: String,
    description: String,
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
)

const Complaint = mongoose.model('Complaint', complaintSchema)

export default Complaint
