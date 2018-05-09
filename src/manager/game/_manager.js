const { ClientManager } = require('../../../lib/patchwire')
const ERROR = require('../../error')
const CMD = require('../../cmd')

class GameManager extends ClientManager {
  constructor() {
    super()
    this.currentGroupIndex = 1
    this.groups = {}
    // 用于查找特定 id 的用户位于哪个 group
    this.clientIdMap = {}
  }

  addClientGroup(clients) {
    clients.forEach((client, index) => {
      this.addClient(client)
      this.clientIdMap[client.clientId] = this.currentGroupIndex
      client.set('currentGroup', this.currentGroupIndex)
      client.set('groupIndex', index)
      client.send(CMD.GAME_START, {
        gameId: this.currentGroupIndex,
        players: clients.map(client => client.clientName),
        idx: index,
      })
    })

    this.groups[this.currentGroupIndex] = {
      id: this.currentGroupIndex,
      clients,
    }
    this.currentGroupIndex++
  }

  getGroupIdByClientId(clientId) {
    return this.clientIdMap[clientId]
  }

  groupBroadcast(currentClient, cmd, data, filter = client => true) {
    if (typeof data === 'undefined') {
      data = cmd
    } else {
      data.cmd = cmd
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
  gameManager.groupBroadcast(client, CMD.PLAYER_DROP, {
    name: client.clientName,
  })
})

gameManager.setTickMode(true)
gameManager.setTickRate(20)
gameManager.startTicking()
module.exports = gameManager
