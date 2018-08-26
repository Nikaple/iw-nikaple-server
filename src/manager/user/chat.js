const { Client } = require('../../../lib/patchwire')
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
module.exports = (client, { msg, scope, lobbyId }) => {
    const response = {
        msg,
        from: client.clientName,
    }
    if (scope === 'user') {
        userManager.broadcast(CMD.CHAT, response)
        return
    }
    if (scope === 'lobby') {
        const lobby = lobbyManager.getLobbyById(lobbyId, true)
        if (lobby) {
            lobby.getClients().forEach(client => {
                client.send(CMD.CHAT, response)
            })
        }
    }
    if (scope === 'game') {
        gameManager.groupBroadcast(client, CMD.CHAT, response)
    }
}
