const { ClientManager, Client } = require('../../../lib/patchwire')
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

    /**
     * 生成游戏编号
     *
     * @returns {number} 
     * @memberof GameManager
     */
    getAvailableIndex() {
        this.currentGroupIndex = (this.currentGroupIndex + 1) % 10000
        return this.currentGroupIndex
    }

    /**
     * 添加一个游戏组
     *
     * @param {{}} groupData
     * @returns
     * @memberof GameManager
     */
    addGroup(groupData) {
        const groupIndex = this.getAvailableIndex()
        this.groups[groupIndex] = {
            id: groupIndex,
            order: [],
            ...groupData,
        }
        return groupIndex
    }

    /**
     * 将所有客户端拉入一个游戏组
     *
     * @param {Client[]} clients
     * @memberof GameManager
     */
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
            this.startHeartbeat(client);
        })
    }

    /**
     * 开始给客户端发送心跳包
     *
     * @param {Client} client
     * @memberof GameManager
     */
    startHeartbeat(client) {
        client.set('heartbeat', 0)
        // 清除遗留的心跳计时器
        if (client.get('heartbeat_timer')) {
            clearInterval(client.get('heartbeat_timer'))
        }
        // 3 秒发送一个即可，3 次超时判定为断线
        const timer = setInterval(() => {
            const currentHeartbeatCount = client.get('heartbeat')
            if (currentHeartbeatCount >= 3) {
                this.removePlayer(client)
                return clearInterval(client.get('heartbeat_timer'));
            }
            client.send(CMD.HEARTBEAT, {
                idx: currentHeartbeatCount
            })
            client.set('heartbeat', currentHeartbeatCount + 1)
        }, 3000)
        client.set('heartbeat_timer', timer)
    }


    /**
     * 找到客户端位于哪个组中
     *
     * @param {string} clientId
     * @returns
     * @memberof GameManager
     */
    getGroupByClientId(clientId) {
        return this.groups[this.clientIdMap[clientId]]
    }

    /**
     * 根据 ip 找到对应的组
     *
     * @param {string} ip
     * @param {string} port
     * @returns
     * @memberof GameManager
     */
    getGroupByAddress(ip, port) {
        return this.groups[this.clientAddressMap[`${ip}:${port}`]]
    }

    /**
     * 组内广播消息
     *
     * @param {Client} currentClient
     * @param {string} cmd
     * @param {{}} data
     * @param {() => boolean} filter
     * @memberof GameManager
     */
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

    /**
     * 将玩家从组中移除，并向其他人发送掉线事件
     *
     * @param {*} client
     * @memberof GameManager
     */
    removePlayer(client) {
        if (!client) {
            return
        }
        gameManager.groupBroadcast(client, CMD.PLAYER_DROP, {
            name: client.clientName,
        }, () => true)
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
    }
}

const gameManager = new GameManager()

gameManager.on('clientDropped', client => {
    gameManager.removePlayer(client)
})

gameManager.setTickMode(true)
gameManager.setTickRate(20)
gameManager.startTicking()
module.exports = gameManager
