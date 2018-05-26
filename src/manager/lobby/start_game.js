const { Client } = require('../../../lib/patchwire')
const CMD = require('../../cmd')
const ERROR = require('../../error')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const lobbyManager = require('./_manager')
const gameManager = require('../game/_manager')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, { lobbyId }) => {
    const lobby = lobbyManager.lobbies[lobbyId]
    if (!lobby) {
        client.send(CMD.LOBBY_NOT_EXISTS)
        return
    }
    if (lobby.host !== client) {
        client.send(CMD.LOBBY_NOT_AUTHORIZED)
        return
    }
    gameManager.addClientGroup(lobby.getClients())
    lobby.getClients().forEach(client => {
        client.set('currentLobbyId', undefined)
    })
    delete lobbyManager.lobbies[lobbyId]
}
