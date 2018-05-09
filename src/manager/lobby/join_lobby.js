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
    return
  }

  client.set('currentLobbyId', lobby.id)
  lobby.broadcast(CMD.LOBBY_JOIN_SUCCESS, {
    lobbyId: lobby.id,
    guest: client.clientName,
  })
}
