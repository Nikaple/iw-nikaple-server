const { Client } = require('../../../../lib/patchwire')
const gameManager = require('../_manager')
const CMD = require('../../../cmd')
const random = require('lodash/random')

/**
 *
 *
 * @param {Client} client
 * @param {object} data
 */
module.exports = (client, data) => {
    const { name, seed, order } = data
    const broadcast = (filter, waitData) => {
        gameManager.groupBroadcast(
            client,
            CMD.GAME_SYNC,
            {
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
    if (order && !group.order.includes(client)) {
        group.order.push(client)
    }
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
        if (order) {
            syncData.order = group.order.map(client => client.clientName)
            group.order = []
        }
        clients.forEach(client => {
            client.deleteFlag(flag)
        })
        broadcast(client => true, syncData)
    } else {
        if (order) {
            data.order = group.order.indexOf(client) + 1
        }
        broadcast(currentClient => currentClient !== client, data)
    }
}
