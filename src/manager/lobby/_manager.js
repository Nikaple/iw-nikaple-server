const { ClientManager } = require('../../../lib/patchwire')
const ERROR = require('../../error')
const Lobby = require('../../util/lobby')

class LobbyManager extends ClientManager {
  constructor() {
    super()
    this.currentIndex = 1
    this.lobbies = {}
  }

  clearLobbyByHostId(hostId) {
    Object.keys(this.lobbies)
      .filter(id => {
        return this.lobbies[id].hostId === hostId
      })
      .forEach(id => {
        delete this.lobbies[id]
      })
  }

  createLobby(lobby) {
    this.clearLobbyByHostId(lobby.hostId)

    const currentLobby = new Lobby({ ...lobby, id: this.currentIndex })
    this.lobbies[this.currentIndex] = currentLobby
    this.currentIndex++
    return currentLobby
  }

  joinLobby({ id, password, guest }) {
    const lobby = this.lobbies[id]
    if (!lobby) {
      return ERROR.LOBBY_NOT_EXISTS
    }
    if (password !== lobby.password) {
      return ERROR.LOBBY_PASS_NOT_VALID
    }
    if (lobby.getClients().includes(guest)) {
      return ERROR.LOBBY_SAME_ID
    }
    lobby.addGuest(guest)
    return lobby
  }
}

const lobbyManager = new LobbyManager()

module.exports = lobbyManager
