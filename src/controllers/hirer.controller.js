import redisClient from '../config/redis.js'
import User from '../models/User.js'
import cloudinary from '../config/cloudinary.js'

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.user
    const redisKey = `user:${id}`

    const cachedProfile = await redisClient.get(redisKey)
    if (cachedProfile) {
      return res.status(200).json({
        message: 'Profile fetched successfully (from cache)',
        user: JSON.parse(cachedProfile),
      })
    }

    const user = await User.findById(id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await redisClient.setEx(redisKey, 300, JSON.stringify(user))

    res.status(200).json({
      message: 'Profile fetched successfully',
      user,
    })
  } catch (error) {
    console.error('getUserProfile error:', error)
    res.status(500).json({ message: `Error from API: ${error.message}` })
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { fullName, phone, gender, location } = req.body

    const updateFields = {}

    if (fullName) updateFields.fullName = fullName
    if (phone) updateFields.phone = phone
    if (gender) updateFields.gender = gender
    if (location) updateFields.location = location

    if (req.body.profilePic) {
      const uploaded = await cloudinary.uploader.upload(req.body.profilePic, {
        folder: 'user_profilePics',
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
      })
      updateFields.profilePic = uploaded.secure_url
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    }).select('-password')

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (redisClient) {
      const redisKey = `user:${userId}`
      await redisClient.setEx(redisKey, 300, JSON.stringify(updatedUser)) // 5 min TTL
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('updateUserProfile error:', error)
    res
      .status(500)
      .json({ message: 'Error updating profile', error: error.message })
  }
}
