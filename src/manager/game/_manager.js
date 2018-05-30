const { ClientManager } = require('../../../lib/patchwire')
const ERROR = require('../../error')
const CMD = require('../../cmd')
const config = require('../../../config')

class GameManager extends ClientManager {
    constructor() {
        super()
        this.currentGroupIndex = 1
        this.groups = {}
        // 用于查找特定 id 的用户位于哪个 group
        this.clientIdMap = {}
        this.clientAddressMap = {}
    }

    getAvailableIndex() {
        for (let i = 1; i <= config.maxGameGroups; i++) {
            if (!(i in this.groups)) {
                return i
            }
        }
    }

    addGroup(groupData) {
        const groupIndex = this.getAvailableIndex()
        this.groups[groupIndex] = {
            id: groupIndex,
            ...groupData,
        }
        return groupIndex
    }

    addClientGroup(clients) {
        const groupIndex = this.addGroup({ clients })
        clients.forEach((client, index) => {
            this.addClient(client)
            this.clientIdMap[client.clientId] = groupIndex
            this.clientAddressMap[
                `${client.get('udpIp')}:${client.get('udpPort')}`
            ] = groupIndex
            client.set('currentGroup', groupIndex)
            client.set('groupIndex', index + 1)
            client.send(CMD.GAME_START, {
                gameId: groupIndex,
                players: clients.map(client => client.clientName),
                idx: index + 1,
            })
        })
    }

    getGroupByClientId(clientId) {
        return this.groups[this.clientIdMap[clientId]]
    }

    getGroupByAddress(ip, port) {
        return this.groups[this.clientAddressMap[`${ip}:${port}`]]
    }

    groupBroadcast(currentClient, cmd, data, filter) {
        if (typeof data === 'undefined') {
            data = cmd
        } else {
            data.cmd = cmd
        }

        if (!filter) {
            filter = client => client !== currentClient
        }

        const currentGroup = this.getGroupByClientId(currentClient.clientId)
        if (!currentGroup) {
            return
        }
        currentGroup.clients.filter(filter).forEach(client => {
            client.send({
                idx: currentClient.get('groupIndex'),
                ...data,
            })
        })
    }
}

const gameManager = new GameManager()

gameManager.on('clientDropped', client => {
    gameManager.groupBroadcast(client, CMD.PLAYER_DROP, {
        name: client.clientName,
    })
    const currentGroup = gameManager.getGroupByClientId(client.clientId)
    if (!currentGroup) {
        return
    }
    currentGroup.clients = currentGroup.clients.filter(
        groupClient => groupClient !== client
    )
    if (currentGroup.clients.length === 0) {
        delete gameManager.groups[currentGroup.id]
    }
})

gameManager.setTickMode(true)
gameManager.setTickRate(20)
gameManager.startTicking()
module.exports = gameManager
