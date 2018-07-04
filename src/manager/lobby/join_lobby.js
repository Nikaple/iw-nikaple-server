const { Client } = require('../../../lib/patchwire')
const lobbyManager = require('./_manager')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const CMD = require('../../cmd')
const ERROR = require('../../error')

/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, { lobbyId, password }) => {
    const lobby = lobbyManager.joinLobby(client, {
        id: lobbyId,
        password,
        guest: client,
    })

    if (lobby === null) {
        client.send(CMD.LOBBY_NOT_EXISTS)
        return
    }

    client.set('currentLobbyId', lobby.id)
    lobbyManager.broadcast(CMD.LOBBY_JOIN_SUCCESS, {
        id: lobby.id,
        name: lobby.name,
        mode: lobby.mode,
        guest: client.clientName,
        players: lobby.getClients().map(client => client.clientName),
    })
}
