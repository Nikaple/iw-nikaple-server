const { Client } = require('../../../lib/patchwire')
const CMD = require('../../cmd')
const lobbyManager = require('./_manager')
const mapValues = require('lodash/mapValues')
const map = require('lodash/map')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data = {}) => {
    client.send(CMD.LOBBY_FETCH_SUCCESS, {
        lobbies: map(lobbyManager.lobbies, lobby => ({
            id: lobby.id,
            name: lobby.name,
            players: map(lobby.getClients(), 'clientName'),
            needPass: !!lobby.password,
        })),
    })
}
