const { Client } = require('../../../lib/patchwire')
const CMD = require('../../cmd')
const lobbyManager = require('./_manager')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data) => {
  client.send(CMD.LOBBY_FETCH, {
    lobbies: Object.keys(lobbyManager.lobbies)
      .map(key => lobbyManager[key])
      .map(lobby => ({
        id: lobby.id,
        name: lobby.name,
        creator: lobby.host.clientName,
        needPass: !!lobby.password,
      })),
  })
}
