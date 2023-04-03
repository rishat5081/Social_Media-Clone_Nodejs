const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TestSchema = new Schema({
  test : {},
  createdAt: { type: Date, default: Date.now },
})



module.exports = mongoose.model('test', TestSchema)