const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TokenSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },

  token: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
})



module.exports = mongoose.model('token', TokenSchema)