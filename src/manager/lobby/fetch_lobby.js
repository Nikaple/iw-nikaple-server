const { Client } = require('../../../lib/patchwire')
const CMD = require('../../cmd')
const lobbyManager = require('./_manager')
/**
 *
 *
 * @param {Client} socket
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (socket, data) => {
  socket.send(CMD.LOBBY_FETCH, {
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
