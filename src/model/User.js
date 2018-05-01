const mongoose = require('mongoose')
const userPlugin = require('mongoose-user')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: { type: String, default: '', minlength: 1, maxlength: 40 },
  email: { type: String, default: '' },
  hashed_password: { type: String, default: '' },
  salt: { type: String, default: '' },
})

UserSchema.plugin(userPlugin, {})

mongoose.model('User', UserSchema)

module.exports = UserSchema
