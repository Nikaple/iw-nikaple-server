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
                    save_wait: {
                        ...data,
                        ...additionalData,
                    },
                },
            },
            filter
        )
    }

    const { id: saveId } = data
    const saveFlag = `saved-${saveId}`
    client.set(saveFlag, true)
    const group = gameManager.getGroupByClientId(client.clientId)
    const clients = group.clients
    const IsAllPlayersSaved = clients.every(
        client => client.get(saveFlag) === true
    )
    if (IsAllPlayersSaved) {
        clients.forEach(client => {
            client.set(saveFlag, false)
        })
        broadcast(client => true, { fin: 1 })
    } else {
        broadcast(currentClient => currentClient !== client)
    }
}
