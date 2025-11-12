import mongoose from 'mongoose'

const verificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  code: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true, index: true, expires: 0 },
})

const VerificationCode = mongoose.model(
  'VerificationCode',
  verificationCodeSchema
)

export default VerificationCode
