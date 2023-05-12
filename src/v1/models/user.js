const mongoose = require('mongoose')
const { schemaOptions } = require('./modelOptions')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  phone: {
    type: String,
    required: false,
    default: ''
  },
  fullName: {
    type: String,
    required: false,
    default: ''
  },
  email: {
    type: String,
    required: false,
    default: ''
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default:'male',
    required: false,
  },
  profilePhoto: {
    type: Buffer,
    required: false,
    default: ''
  },
  dateOfBirth: {
    type: Date,
    required: false
  }
}, schemaOptions)

module.exports = mongoose.model('User', userSchema)