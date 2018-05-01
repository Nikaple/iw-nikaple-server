const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const lobbyManager = require('./_manager')
const COMMAND = require('../../command')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.command
 */
module.exports = (client, { name, password }) => {
  if (!client.clientName) {
    client.send(COMMAND.LOGIN_NEEDED)
  }

  const lobby = lobbyManager.createLobby({
    name,
    password,
    host: client,
  })

  client.set('currentLobbyId', lobby.id)
  lobbyManager.broadcast(COMMAND.LOBBY_CREATE_SUCCESS, {
    lobbyId: lobby.id,
    creator: client.clientName,
    needPass: !!password,
  })
}
