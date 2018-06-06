const { Client } = require('../../../../lib/patchwire')
const gameManager = require('../_manager')
const CMD = require('../../../cmd')

/**
 *
 *
 * @param {Client} client
 * @param {object} data
 */
module.exports = (client, data) => {
    const room = data.roomTo
    if (room !== '') {
        client.set('currentRoom', room)
    }
    // clear flags
    client.resetFlags()
    gameManager.groupBroadcast(
        client,
        CMD.GAME_SYNC,
        {
            e: {
                warp: {
                    ...data,
                },
            },
        },
        currentClient => currentClient !== client
    )
}
