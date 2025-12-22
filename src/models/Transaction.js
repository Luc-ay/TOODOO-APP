import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'payment'],
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'canceled'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

const Transaction = mongoose.model('Transaction', transactionSchema)

export default Transaction
