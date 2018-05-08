const { Client } = require('../../../lib/patchwire')
const COMMAND = require('../../command')
const lobbyManager = require('./_manager')
/**
 *
 *
 * @param {Client} socket
 * @param {object} data
 * @param {string} data.command
 */
module.exports = (socket, data) => {
  socket.send(COMMAND.LOBBY_FETCH, {
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
