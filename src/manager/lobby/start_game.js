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
    const lobby = lobbyManager.getLobbyById(lobbyId, true)
    if (!lobby) {
        return client.send(CMD.LOBBY_NOT_EXISTS)
    }
    if (lobby.host !== client) {
        return client.send(CMD.LOBBY_NOT_AUTHORIZED)
    }
    gameManager.addClientGroup(lobby.getClients())
    lobby.getClients().forEach(client => {
        client.set('currentLobbyId', undefined)
    })
    lobbyManager.dismissLobby(lobby)
}
