const mongoose = require('mongoose')
const userPlugin = require('mongoose-user')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: {
        type: String,
        default: '',
        validate: {
            validator: v => {
                const chineseCharacters =
                    v.match(/%[0-9a-f]{2}%[0-9a-f]{2}/g) || []
                const usernameLength = v.length - 5 * chineseCharacters.length
                return usernameLength >= 1 && usernameLength <= 20
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
