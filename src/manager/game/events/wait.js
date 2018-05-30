const gameManager = require('../_manager')
const CMD = require('../../../cmd')
const random = require('lodash/random')

module.exports = (client, data) => {
    const { name, seed } = data
    const broadcast = (filter, waitData) => {
        gameManager.groupBroadcast(
            client,
            CMD.GAME_SYNC,
            {
                idx: client.get('groupIndex'),
                w: {
                    [name]: {
                        ...waitData,
                    },
                },
            },
            filter
        )
    }
    // set client flag
    const flag = `${name}-${data.flag}`
    client.setFlag(flag)
    delete data.flag
    delete data.name

    const group = gameManager.getGroupByClientId(client.clientId)
    const clients = group.clients
    const shouldContinue = clients.every(
        client => client.getFlag(flag) === true
    )
    if (shouldContinue) {
        const syncData = {
            ...data,
            fin: 1,
        }
        if (seed) {
            syncData.seed = 1 + random(1000000000)
        }
        clients.forEach(client => {
            client.deleteFlag(flag)
        })
        broadcast(client => true, syncData)
    } else {
        broadcast(currentClient => currentClient !== client, data)
    }
}
