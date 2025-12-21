import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

const Favourite = mongoose.model('Favourite', favoriteSchema)

export default Favourite
