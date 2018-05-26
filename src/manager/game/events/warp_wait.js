const gameManager = require('../_manager')
const CMD = require('../../../cmd')
const random = require('lodash/random')

module.exports = (client, data) => {
    const broadcast = (filter, additionalData) => {
        gameManager.groupBroadcast(
            client,
            CMD.GAME_SYNC,
            {
                idx: client.get('groupIndex'),
                e: {
                    warp_wait: {
                        ...data,
                        ...additionalData,
                    },
                },
            },
            filter
        )
    }

    const { room, roomTo } = data
    const warpFlag = `warp-${room}-${roomTo}`
    client.set(warpFlag, true)
    const group = gameManager.getGroupByClientId(client.clientId)
    const clients = group.clients
    const IsAllPlayersInWarp = clients.every(
        client => client.get(warpFlag) === true
    )
    if (IsAllPlayersInWarp) {
        // random seed
        const seed = 1 + random(1000000000)
        clients.forEach(client => {
            client.set(warpFlag, false)
        })
        broadcast(client => true, { seed })
    }
    broadcast(currentClient => currentClient !== client)
}
