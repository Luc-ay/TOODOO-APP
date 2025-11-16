import redisClient from '../config/redis.js'
import User from '../models/User.js'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcrypt'

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

    if (req.file) {
      updateFields.profilePic = req.file.filename
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    }).select('-password')

    if (!updatedUser) return res.status(404).json({ message: 'User not found' })

    if (redisClient) {
      const redisKey = `user:${userId}`
      await redisClient.del(redisKey)
    }

    await redisClient.setEx(`user:${userId}`, 300, JSON.stringify(updatedUser))

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

export const changePWD = async (req, res) => {
  try {
    const userId = req.user.id
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ message: 'Password cannot be empty' })
    }

    if (password.length <= 5) {
      return res.status(409).json({ message: 'Password is too short' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isSame = await bcrypt.compare(password, user.password)
    if (isSame) {
      return res
        .status(400)
        .json({ message: 'Password cannot be the same as old password' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password
    user.password = hashedPassword
    await user.save()

    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('changePWD error:', error)
    res
      .status(500)
      .json({ message: 'Error changing password', error: error.message })
  }
}
