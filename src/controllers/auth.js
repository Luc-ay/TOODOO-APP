import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import VerificationCode from '../models/Verify-user.js'
import { sendVerificationEmail } from '../utils/sendVerificationEmail.js'

export const hirer_register = async (req, res) => {
  try {
    const { fullName, email, phone, password, gender } = req.body

    if (!fullName || !email || !phone || !password || !gender) {
      return res.status(400).json({
        Message: 'All field is required',
      })
    }
    if (phone.length !== 10) {
      return res.status(400).json({
        Message: 'Phone must be exactly 10 digits',
      })
    }

    const emailExist = await User.findOne({ email })

    if (emailExist) {
      return res.status(400).json({
        Message: 'User Already Exist',
      })
    }

    const hashPWD = await bcrypt.hash(password, 10)
    const role = 'hirer'
    const createUser = new User({
      fullName,
      email,
      phone,
      password: hashPWD,
      gender,
      role,
    })

    await createUser.save()

    createUser.password = undefined

    await sendVerificationEmail(email, fullName)

    return res.status(201).json({
      message: 'User registered successfully. Verification code sent to email.',
      User: createUser,
    })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      const value = error.keyValue[field]

      return res.status(400).json({
        message: `User with this ${field} (${value}) already exists.`,
      })
    }
  }
}

export const worker_register = async (req, res) => {
  try {
    const { fullName, email, phone, password, gender } = req.body

    if (!fullName || !email || !phone || !password || !gender) {
      return res.status(400).json({
        Message: 'All field is required',
      })
    }

    if (phone.lenght !== 10) {
      return res.status(400).json({
        Message: 'Phone must be exactly 10 digits',
      })
    }

    const emailExist = await User.findOne({ email })

    if (emailExist) {
      return res.status(400).json({
        Message: 'User Already Exist',
      })
    }

    const hashPWD = await bcrypt.hash(password, 10)
    const role = 'worker'
    const createUser = new User({
      fullName,
      email,
      phone,
      password: hashPWD,
      gender,
      role,
    })

    await createUser.save()

    createUser.password = undefined

    await sendVerificationEmail(email, fullName)

    return res.status(201).json({
      message: 'User registered successfully. Verification code sent to email.',
      User: createUser,
    })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      const value = error.keyValue[field]

      return res.status(400).json({
        message: `User with this ${field} (${value}) already exists.`,
      })
    }
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(401).json({
        message: 'All field is required',
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(409)
        .json({ message: 'Email or Password does not match' })
    }

    const verifyPwd = await bcrypt.compare(password, user.password)
    if (!verifyPwd) {
      return res
        .status(409)
        .json({ message: 'Email or Password does not match' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      message: 'Login successful',
      token,
      role: user.role,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error from Server', error: error.message })
  }
}

export const changePassword = async (req, res) => {
  try {
  } catch (error) {
    return res.send(500).json({
      Message: `Error from server ${error.message}`,
    })
  }
}

export const verifyCode = async (req, res) => {
  const { code } = req.body

  if (!code) {
    return res.status(400).json({ message: 'Verification code is required' })
  }

  try {
    const record = await VerificationCode.findOne({ code })

    if (!record) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired verification code' })
    }

    if (record.expiresAt < new Date()) {
      await VerificationCode.deleteOne({ email: record.email })
      return res.status(400).json({ message: 'Verification code expired' })
    }

    // Mark the user as verified
    const user = await User.findOneAndUpdate(
      { email: record.email },
      { isVerified: true },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Delete the verification record after successful verification
    await VerificationCode.deleteOne({ email: record.email })

    return res.status(200).json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}
