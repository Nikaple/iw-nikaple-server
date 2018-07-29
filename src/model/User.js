const mongoose = require('mongoose')
const userPlugin = require('./UserPlugin')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: {
        type: String,
        default: '',
        validate: {
            validator: v => {
                const specialCharacters = v.match(/%[0-9a-f]{2}/g) || []
                const usernameLength = v.length - 2 * specialCharacters.length
                return usernameLength >= 2 && usernameLength <= 20
            },
            msg: 'username_not_valid',
        },
        index: true,
    },
    email: { type: String, default: '' },
    hashed_password: { type: String, default: '' },
    salt: { type: String, default: '' },
    data: {
        type: Object,
        default: {},
    },
})

UserSchema.plugin(userPlugin, {})

mongoose.model('User', UserSchema)

module.exports = UserSchema
