const { Client } = require('../../../lib/patchwire')
const COMMAND = require('../../command')
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
 * @param {string} data.command
 */
module.exports = (client, { lobbyId }) => {
  const lobby = lobbyManager.lobbies[lobbyId]
  if (!lobby) {
    client.send(COMMAND.LOBBY_NOT_EXISTS)
    return
  }
  if (lobby.host !== client) {
    client.send(COMMAND.LOBBY_NOT_AUTHORIZED)
    return
  }
  gameManager.addClientGroup(lobby.getClients())
  delete lobbyManager.lobbies[lobbyId]
}
