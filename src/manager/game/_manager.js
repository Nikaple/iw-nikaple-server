const { ClientManager } = require('../../../lib/patchwire')
const ERROR = require('../../error')
const COMMAND = require('../../command')

class GameManager extends ClientManager {
  constructor() {
    super()
    this.currentIndex = 1
    this.groups = {}
    // 用于查找特定 id 的用户位于哪个 group
    this.clientIdMap = {}
  }

  addClientGroup(clients) {
    clients.forEach((client, index) => {
      this.addClient(client)
      this.clientIdMap[client.clientId] = this.currentIndex
      client.set('currentGroup', this.currentIndex)
      client.send(COMMAND.GAME_START, {
        gameId: this.currentIndex,
        index,
      })
    })

    this.groups[this.currentIndex] = {
      id: this.currentIndex,
      clients,
    }
    this.currentIndex++
  }

  getGroupIdByClientId(clientId) {
    return this.clientIdMap[clientId]
  }

  groupBroadcast(currentClient, command, data, filter = client => true) {
    if (typeof data === 'undefined') {
      data = command
    } else {
      data.command = command
    }

    const groupId = this.getGroupIdByClientId(currentClient.clientId)
    this.groups[groupId].clients
      .filter(client => client !== currentClient)
      .filter(client => filter(client))
      .forEach(client => {
        client.send(data)
      })
  }
}

const gameManager = new GameManager()

gameManager.on('clientDropped', client => {
  gameManager.groupBroadcast(client, COMMAND.PLAYER_DROP, {
    name: client.clientName,
  })
})

gameManager.setTickMode(true)
gameManager.setTickRate(20)
gameManager.startTicking()
module.exports = gameManager
