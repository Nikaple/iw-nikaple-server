const gameManager = require('../_manager')
const CMD = require('../../../cmd')
const each = require('lodash/each')

module.exports = (client, data) => {
    const room = data.roomTo
    if (room !== '') {
        client.set('currentRoom', room)
    }
    // clear warp flag
    each(client.data, (_, key) => {
        if (key.startsWith('warp-')) {
            client.set(key, false)
        }
    })
    client.set('reset_wait', false)
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
