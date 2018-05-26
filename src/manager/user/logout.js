const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const CMD = require('../../cmd')
const userManager = require('./_manager')
const lobbyManager = require('../lobby/_manager')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data) => {
    if (!userManager.getClients().includes(client)) {
        client.send(CMD.LOGIN_NEEDED)
        return
    }
    lobbyManager.leaveLobby(client)
    client.clientId = undefined
    client.clientName = undefined
    client.data = {}
    client.send(CMD.LOGOUT, {
        reason: 'user_intent',
    })
}
