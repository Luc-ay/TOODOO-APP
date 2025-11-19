import WorkerProfile from '../models/Worker.Profile.js'
import User from '../models/User.js'
import redisClient from '../config/redis.js'

export const getWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const redisKey = `user:${userId}`

    const cachedProfile = await redisClient.get(redisKey)
    if (cachedProfile) {
      return res.status(200).json({
        message: 'Profile fetched successfully (from cache)',
        user: JSON.parse(cachedProfile),
      })
    }
    const getUser = await User.findById(userId).select('-password')
    const getWork = await WorkerProfile.find({ userId })
    if (!getWork) {
      return res.status(404).json({ Message: 'Work profile not found' })
    }

    const workProfile = { getUser, getWork }

    await redisClient.setEx(redisKey, 300, JSON.stringify(workProfile))

    return res.status(200).json({
      Message: 'Worker Account Fetched',
      Worker: workProfile,
    })
  } catch (error) {
    console.error('Error updating worker profile:', error)
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

export const updateWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const allowedFields = [
      'serviceType',
      'bio',
      'hourlyRate',
      'rating',
      'totalJobs',
    ]

    const updateData = {}

    if (req.body && Object.keys(req.body).length > 0) {
      Object.keys(req.body).forEach((key) => {
        if (allowedFields.includes(key)) {
          updateData[key] = req.body[key]
        }
      })
    }

    // Fetch worker profile
    const profile = await User.findById(userId).select('-password')
    if (!profile) {
      return res.status(404).json({ message: 'Worker profile not found' })
    }

    // --- SKILLS (sent as JSON string) ---
    if (req.body?.skills) {
      try {
        const parsedSkills = JSON.parse(req.body.skills)
        if (Array.isArray(parsedSkills)) {
          profile.skills = parsedSkills // overwrite completely
        }
      } catch (err) {
        console.log('Invalid skills JSON')
      }
    }

    // --- AVAILABILITY ---
    if (req.body?.availability) {
      try {
        const parsed = JSON.parse(req.body.availability)
        if (Array.isArray(parsed)) {
          profile.availability = parsed
        }
      } catch (err) {
        console.log('Invalid availability JSON')
      }
    }

    // --- CREDENTIALS UPLOAD (multer files) ---
    if (req.files?.credentials) {
      req.files.credentials.forEach((file) => {
        profile.credentials.push(file.filename)
      })
    }

    // --- GALLERY UPLOAD ---
    if (req.files?.gallery) {
      req.files.gallery.forEach((file) => {
        profile.gallery.push(file.filename)
      })
    }

    // Apply text field updates
    Object.assign(profile, updateData)

    // Save everything
    const work = WorkerProfile
    const saved = await work.save()

    res.status(200).json({
      message: 'Worker profile updated successfully',
      worker: saved,
    })
  } catch (error) {
    console.error('Error updating worker profile:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}
