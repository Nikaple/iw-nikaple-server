const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const CMD = require('../../cmd')
const escapeRegex = require('escape-regexp')
const dlv = require('dlv')
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
        return client.send(CMD.REGISTER_FAILED, {
            msg: 'password_not_valid',
        })
    }
    User.findOne({
        name: {
            $regex: new RegExp(`^${escapeRegex(name)}$`),
            $options: 'i',
        },
    })
        .then(user => {
            if (user) {
                throw new Error('username_exists')
            }
            return new User({ name, password }).save()
        })
        .then(newUser => {
            client.clientId = newUser._id.toString()
            return client.send(CMD.REGISTER_SUCCESS, {
                id: client.clientId,
                name,
            })
        })
        .catch(err => {
            const msg = dlv(err, 'errors.name.message') || err.message
            return client.send(CMD.REGISTER_FAILED, { msg })
        })
}
