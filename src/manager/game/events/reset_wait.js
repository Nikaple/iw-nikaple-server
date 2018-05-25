const gameManager = require('../_manager')
const CMD = require('../../../cmd')

module.exports = (client, data) => {
    const broadcast = (filter, additionalData) => {
        gameManager.groupBroadcast(
            client,
            CMD.GAME_SYNC,
            {
                idx: client.get('groupIndex'),
                e: {
                    reset_wait: {
                        ...data,
                        ...additionalData,
                    },
                },
            },
            filter
        )
    }

    const resetFlag = `resetPressed`
    client.set(resetFlag, true)
    const group = gameManager.getGroupByClientId(client.clientId)
    const clients = group.clients
    const IsAllPlayersReset = clients.every(
        client => client.get(resetFlag) === true
    )
    if (IsAllPlayersReset) {
        clients.forEach(client => {
            client.set(resetFlag, false)
        })
        broadcast(client => true, { fin: 1 })
    }
    broadcast(currentClient => currentClient !== client)
}
