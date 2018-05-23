const { ClientManager } = require('../../../lib/patchwire')
const ERROR = require('../../error')
const CMD = require('../../cmd')
const Lobby = require('../../util/lobby')
const config = require('../../../config')

class LobbyManager extends ClientManager {
  constructor() {
    super()
    this.currentIndex = 1
    this.lobbies = {}
  }

  checkLogin(client) {
    if (!client.clientName) {
      client.send(CMD.LOGIN_NEEDED)
      throw Error()
    }
    return true
  }

  checkPassword(client, lobby, password) {
    if (password !== lobby.password) {
      client.send(CMD.LOBBY_PASS_NOT_VALID)
      throw Error()
    }
    return true
  }

  checkAlreadyInLobbyBeforeLeave(client, lobby) {
    if (!lobby.getClients().includes(client)) {
      client.send(CMD.UNKNOWN_ERROR)
      throw Error()
    }
    return true
  }

  checkAlreadyInLobbyBeforeJoin(client, lobby) {
    if (lobby.getClients().includes(client)) {
      client.send(CMD.LOBBY_SAME_ID)
      throw Error()
    }
    return true
  }

  checkLobbyIsFull(client, lobby) {
    if (lobby.getClients().length >= config.maxLobbyPlayers) {
      client.send(CMD.LOBBY_IS_FULL)
      throw Error()
    }
    return true
  }

  removeClients(clients) {
    this.clients = this.clients.filter(client => !clients.includes(client))
  }

  getCurrentLobbyId(client) {
    const currentLobbyId = client.get('currentLobbyId')
    if (!currentLobbyId) {
      client.send(CMD.LOBBY_NOT_FOUND)
      throw Error()
    }
    return currentLobbyId
  }

  getLobbyById(lobbyId) {
    const lobby = lobbyManager.lobbies[lobbyId]
    if (!lobby) {
      client.send(CMD.LOBBY_NOT_EXISTS)
      throw Error()
    }
    return lobby
  }

  createLobby(client, lobby) {
    try {
      this.checkLogin(client)
      this.leaveLobbySilent(client)
      const currentLobby = new Lobby({ ...lobby, id: this.currentIndex })
      this.lobbies[this.currentIndex] = currentLobby
      this.currentIndex++
      return currentLobby
    } catch (err) {
      return null
    }
  }

  joinLobby(client, { id, password, guest }) {
    try {
      this.checkLogin(client)
      const lobby = this.getLobbyById(id)
      this.checkPassword(client, lobby, password)
      this.checkAlreadyInLobbyBeforeJoin(client, lobby)
      this.checkLobbyIsFull(client, lobby)
      lobby.addGuest(guest)
      return lobby
    } catch (err) {
      return null
    }
  }

  leaveLobby(client) {
    try {
      this.checkLogin(client)
      const currentLobbyId = this.getCurrentLobbyId(client)
      const currentLobby = this.getLobbyById(currentLobbyId)
      this.checkAlreadyInLobbyBeforeLeave(client, currentLobby)
      if (client === currentLobby.host) {
        // 房主退出房间，所有人断开
        this.leaveLobbyHost(currentLobby)
        return
      }
      this.leaveLobbyGuest(client, currentLobby)
    } catch (err) {
      return null
    }
  }

  leaveLobbySilent(client) {
    Object.keys(this.lobbies)
      .filter(id => {
        return this.lobbies[id].getClients().includes(client)
      })
      .forEach(id => {
        const currentLobby = this.lobbies[id]
        if (currentLobby.host === client) {
          this.dismissLobby(currentLobby)
        } else {
          this.leaveLobbyGuest(client, currentLobby)
        }
      })
  }

  // 解散房间
  dismissLobby(lobby) {
    return this.leaveLobbyHost(lobby)
  }

  leaveLobbyHost(lobby) {
    if (!lobby) {
      return
    }
    lobby.getClients().forEach(client => {
      client.set('currentLobbyId', undefined)
    })
    lobbyManager.getClients().forEach(client => {
      client.send(CMD.LOBBY_LEAVE_SUCCESS, {
        id: lobby.id,
        isHost: true,
      })
    })
    delete this.lobbies[lobby.id]
  }

  // 非房主离开房间
  leaveLobbyGuest(client, lobby) {
    if (!lobby) {
      return
    }
    client.set('currentLobbyId', undefined)
    lobbyManager.getClients().forEach(otherClient => {
      otherClient.send(CMD.LOBBY_LEAVE_SUCCESS, {
        id: lobby.id,
        name: client.clientName,
      })
    })
    lobby.guests = lobby.guests.filter(guest => guest !== client)
  }
}

const lobbyManager = new LobbyManager()

lobbyManager.on('clientDropped', client => {
  if (client.get('currentLobbyId') > 0) {
    lobbyManager.leaveLobbySilent(client)
  }
})

module.exports = lobbyManager
