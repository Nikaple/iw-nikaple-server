const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const CMD = require('../../cmd')
const userManager = require('./_manager')
const lobbyManager = require('../lobby/_manager')
const gameManager = require('../game/_manager')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data) => {
    if (!userManager.getClients().includes(client)) {
        return client.send(CMD.LOGIN_NEEDED)
    }
    lobbyManager.leaveLobby(client)
    gameManager.removePlayer(client)
    client.clientId = undefined
    client.clientName = undefined
    client.data = {}
    return client.send(CMD.LOGOUT, {
        reason: 'user_intent',
    })
}
