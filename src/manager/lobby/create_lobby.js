const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const lobbyManager = require('./_manager')
const CMD = require('../../cmd')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, { name, password }) => {
  const lobby = lobbyManager.createLobby(client, {
    name,
    password,
    host: client,
  })

  if (lobby === null) {
    return
  }

  client.set('currentLobbyId', lobby.id)
  lobbyManager.broadcast(CMD.LOBBY_CREATE_SUCCESS, {
    id: lobby.id,
    name: lobby.name,
    players: [client.clientName],
    needPass: !!password,
  })
}
