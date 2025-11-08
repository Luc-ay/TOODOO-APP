import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['hirer', 'worker'], required: true },
    isVerified: { type: Boolean, default: false },
    profilePic: { type: String },
    location: {
      country: String,
      state: String,
      area: String,
      address: String,
    },
    walletBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
