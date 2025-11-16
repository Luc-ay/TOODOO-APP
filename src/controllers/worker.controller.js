import WorkerProfile from '../models/Worker.Profile.js'
import cloudinary from '../config/multer.js'
import User from '../models/User.js'
import redisClient from '../config/redis.js'

export const getWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const redisKey = `user:${id}`

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
  const { userId } = req.user.id

  const allowedFields = [
    'serviceType',
    'bio',
    'hourlyRate',
    'rating',
    'totalJobs',
    'availability',
  ]

  const updateData = {}

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key]
    }
  })

  try {
    const profile = await WorkerProfile.findOne({ userId })
    if (!profile) {
      return res.status(404).json({ message: 'Worker profile not found' })
    }

    let { skills } = req.body
    if (skills) {
      if (typeof skills === 'string') {
        skills = JSON.parse(skills)
      }
      if (Array.isArray(skills)) {
        profile.skills.push(...skills)
      }
    }

    let { gallery } = req.body
    if (gallery && Array.isArray(gallery)) {
      for (const img of gallery) {
        if (img.startsWith('http')) {
          profile.gallery.push(img)
        } else {
          const result = await cloudinary.uploader.upload(img, {
            folder: 'worker_gallery',
          })
          profile.gallery.push(result.secure_url)
        }
      }
    }

    let { credentials } = req.body
    if (credentials && Array.isArray(credentials)) {
      for (const cred of credentials) {
        if (cred.startsWith('http')) {
          profile.credentials.push(cred)
        } else {
          const result = await cloudinary.uploader.upload(cred, {
            folder: 'worker_credentials',
          })
          profile.credentials.push(result.secure_url)
        }
      }
    }

    Object.assign(profile, updateData)

    // Save updated profile
    const updatedProfile = await profile.save()

    if (redisClient) {
      const redisKey = `user:${userId}`
      await redisClient.setEx(redisKey, 500, JSON.stringify(updatedProfile))
    }
    res.status(200).json({
      message: 'Worker profile updated successfully',
      data: updatedProfile,
    })
  } catch (error) {
    console.error('Error updating worker profile:', error)
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}
