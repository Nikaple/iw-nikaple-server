const gameManager = require('../_manager')
const CMD = require('../../../cmd')
const each = require('lodash/each')

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
            idx: client.get('groupIndex'),
            e: {
                warp: {
                    ...data,
                },
            },
        },
        currentClient => currentClient !== client
    )
}
