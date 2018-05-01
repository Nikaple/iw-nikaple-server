const { Client } = require('../../../lib/patchwire')
const { isUndefined } = require('lodash')
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
module.exports = client => {
  if (!client.clientName) {
    client.send(COMMAND.LOGIN_NEEDED)
    return
  }

  const currentLobbyId = client.get('currentLobbyId')
  if (isUndefined(currentLobbyId)) {
    client.send(COMMAND.LOBBY_NOT_FOUND)
    return
  }

  const currentLobby = lobbyManager.lobbies[currentLobbyId]
  if (!currentLobby) {
    client.send(COMMAND.LOBBY_NOT_EXISTS)
    return
  }

  if (client === currentLobby.host) {
    // 房主退出房间，所有人断开
    currentLobby.getClients().forEach(client => {
      client.set('currentLobbyId', undefined)
      client.send(COMMAND.LOBBY_LEAVE_SUCCESS, {
        isHost: true,
      })
    })
  } else if (currentLobby.guests.includes(client)) {
    // 非房主退出房间，直接断开
    currentLobby.guests = currentLobby.guests.filter(guest => guest !== client)
    lobbyManager.broadcast(COMMAND.LOBBY_LEAVE_SUCCESS, {
      name: client.clientName,
    })
  }
}
