const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const CMD = require('../../cmd')
const escapeRegex = require('escape-regexp')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data) => {
    const { name, password } = data
    const validPassword = /^[\w\W]{4,}$/
    if (!validPassword.test(password)) {
        client.send(CMD.REGISTER_FAILED, {
            msg: 'password_not_valid',
        })
        return
    }
    User.findOne({
        name: {
            $regex: new RegExp(escapeRegex(name)),
            $options: 'i',
        },
    }).then(user => {
        if (user) {
            client.send(CMD.REGISTER_FAILED, {
                msg: 'username_exists',
            })
            return
        }
        const newUser = new User({ name, password, skipValidation: true })
        newUser
            .save()
            .then(user => {
                client.clientId = user._id.toString()
                client.send(CMD.REGISTER_SUCCESS, {
                    id: client.clientId,
                    name,
                })
            })
            .catch(err => {
                client.send(CMD.REGISTER_FAILED, {
                    msg: err.errors.name.message,
                })
            })
    })
}
