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
  if (!client.clientName) {
    client.send(COMMAND.LOGIN_NEEDED)
    return
  }

  const lobby = lobbyManager.joinLobby({
    id: lobbyId,
    password,
    guest: client,
  })
  if (lobby === ERROR.LOBBY_NOT_EXISTS) {
    client.send(COMMAND.LOBBY_NOT_EXISTS)
    return
  }
  if (lobby === ERROR.LOBBY_PASS_NOT_VALID) {
    client.send(COMMAND.LOBBY_PASS_NOT_VALID)
    return
  }
  if (lobby === ERROR.LOBBY_SAME_ID) {
    client.send(COMMAND.LOBBY_SAME_ID)
    return
  }
  client.set('currentLobbyId', lobby.id)
  lobby.broadcast(COMMAND.LOBBY_JOIN_SUCCESS, {
    lobbyId: lobby.id,
    guest: client.clientName,
  })
}
