import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Carpentry, Plumbing
    icon: { type: String }, // optional (frontend use)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Service = mongoose.model('Service', serviceSchema)

export default Service