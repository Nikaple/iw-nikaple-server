const { Client } = require('../../../lib/patchwire')
const lobbyManager = require('./_manager')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const COMMAND = require('../../command')
const ERROR = require('../../error')

/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.command
 */
module.exports = (client, { lobbyId, password }) => {
  const lobby = lobbyManager.joinLobby(client, {
    id: lobbyId,
    password,
    guest: client,
  })

  if (lobby === null) {
    return
  }

  client.set('currentLobbyId', lobby.id)
  lobby.broadcast(COMMAND.LOBBY_JOIN_SUCCESS, {
    lobbyId: lobby.id,
    guest: client.clientName,
  })
}
