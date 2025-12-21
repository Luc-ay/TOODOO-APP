import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

const Chat = mongoose.model('Chat', chatSchema)

export default Chat
