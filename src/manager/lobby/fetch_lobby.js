const { Client } = require('../../../lib/patchwire')
const CMD = require('../../cmd')
const lobbyManager = require('./_manager')
const map = require('lodash/map')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = client => {
    client.send(CMD.LOBBY_FETCH_SUCCESS, {
        lobbies: map(lobbyManager.lobbies, lobby => ({
            id: lobby.id,
            name: lobby.name,
            mode: lobby.mode,
            players: map(lobby.getClients(), 'clientName'),
            needPass: !!lobby.password,
        })),
    })
}
