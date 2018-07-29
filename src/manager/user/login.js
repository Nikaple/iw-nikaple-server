const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const CMD = require('../../cmd')
const userManager = require('./_manager')
const lobbyManager = require('../lobby/_manager')

const toIPv4 = ipv6OrIpv4 => {
    if (ipv6OrIpv4.startsWith('::ffff:')) {
        return ipv6OrIpv4.slice(7)
    }
    return ipv6OrIpv4
}

/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
const verifyLogin = (client, user, name, password) => {
    const userId = user._id.toString()
    if (user.authenticate(password)) {
        const loggedClient = userManager.getClientByUserId(userId)
        if (loggedClient === client && loggedClient.clientName === name) {
            return client.send(CMD.LOGIN_ALREADY, {
                id: client.clientId,
                name: client.clientName,
            })
        }
        if (loggedClient && loggedClient.clientName === name) {
            lobbyManager.leaveLobby(loggedClient, true)
            loggedClient.clientId = undefined
            loggedClient.clientName = undefined
            loggedClient.send(CMD.LOGOUT, {
                reason: 'another_device',
            })
        }
        userManager.addUser(userId, client)
        client.clientId = userId
        client.clientName = user.name
        return client.send(CMD.LOGIN_SUCCESS, {
            id: user._id,
            name: user.name,
        })
    }

    return client.send(CMD.LOGIN_FAILED, {
        msg: 'wrong_password',
    })
}
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, { name, password }) => {
    User.findOne({ name }).then(user => {
        if (!user) {
            client.send(CMD.LOGIN_FAILED, {
                msg: 'username_not_exists',
            })
            return
        }
        verifyLogin(client, user, name, password)
        client.set('ip', toIPv4(client.socket.remoteAddress))
    })
}
