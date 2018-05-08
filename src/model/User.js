const mongoose = require('mongoose')
const userPlugin = require('mongoose-user')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: {
    type: String,
    default: '',
    validate: {
      validator: v => {
        return /^[a-zA-Z][a-zA-Z0-9_- ]{4,30}$/.test(v)
      },
      msg: 'username_not_valid',
    },
  },
  email: { type: String, default: '' },
  hashed_password: { type: String, default: '' },
  salt: { type: String, default: '' },
})

UserSchema.plugin(userPlugin, {})

mongoose.model('User', UserSchema)

module.exports = UserSchema
