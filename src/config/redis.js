// src/config/redis.js
import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

// Create a Redis client using Upstash URL
const redisClient = createClient({
  url: process.env.REDIS_URL,
})

// Add error listener
redisClient.on('error', (err) => console.error('Redis Client Error', err))

export default redisClient
