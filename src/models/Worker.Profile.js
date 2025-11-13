import mongoose from 'mongoose'

const workerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceType: { type: String, required: true },
    skills: [{ name: String, years: Number }],
    bio: String,
    credentials: [String], // links to uploaded IDs or certificates
    gallery: [String], // work sample images
    hourlyRate: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    availability: [
      {
        day: String,
        start: String,
        end: String,
      },
    ],
  },
  { timestamps: true }
)

const WorkerProfile = mongoose.model('WorkerProfile', workerProfileSchema)

export default WorkerProfile
