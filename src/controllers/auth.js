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

    const hashPWD = await bcrypt.hash(password, 7)
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

    res.status(201).json({
      message: 'User registered successfully. Verification code sent to email.',
      User: createUser,
    })

    sendVerificationEmail(email, fullName).catch(console.error)
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
    if (phone.length !== 10) {
      return res.status(400).json({
        Message: 'Phone must be exactly 10 digits',
      })
    }

    const hashPWD = await bcrypt.hash(password, 7)
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

    res.status(201).json({
      message: 'User registered successfully. Verification code sent to email.',
      User: createUser,
    })

    sendVerificationEmail(email, fullName)
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
      return res.status(400).json({ message: 'All fields are required' })
    }

    const user = await User.findOne({ email }).lean() // .lean() returns plain object, faster
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role,
    })
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ Message: 'All fields are required' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ Message: 'Invalid or expired token' })
    }

    const { email } = decoded
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ Message: 'User not found' })
    }

    const hashedPwd = await bcrypt.hash(newPassword, 7)

    await User.findOneAndUpdate(
      { email },
      { password: hashedPwd },
      { new: true }
    )

    return res
      .status(200)
      .json({ Message: 'Password changed successfully. Please log in again.' })
  } catch (error) {
    return res.status(500).json({
      Message: `Error from server: ${error.message}`,
    })
  }
}

export const verifyUser = async (req, res) => {
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
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

export const checktoken = async (req, res) => {
  return res.status(200).json({
    Message: 'It worked',
  })
}

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(409).json({ Message: 'Email is required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(401)
        .json({ Message: 'User not found, please register' })
    }
    const fullName = user.fullName
    console.log(fullName)
    await sendVerificationEmail(email, fullName)

    return res.status(201).json({
      Message: `Verification code sent to ${email}, check your inbox or spam folder`,
    })
  } catch (error) {
    return res.status(500).json({
      Message: `Error in forget password API ${error.message}`,
    })
  }
}

export const verifyPasswordCode = async (req, res) => {
  try {
    const { code } = req.body
    if (!code) {
      return res.status(409).json({ Message: 'Code is required' })
    }

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

    const signCode = jwt.sign({ email: record.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    res.json({ signCode })
  } catch (error) {
    return res.status(500).json({
      Message: `Error from server ${error.message}`,
    })
  }
}
