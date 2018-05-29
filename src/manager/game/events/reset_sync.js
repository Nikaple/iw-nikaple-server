const gameManager = require('../_manager')
const CMD = require('../../../cmd')

module.exports = (client, data) => {
    gameManager.groupBroadcast(
        client,
        CMD.GAME_SYNC,
        {
            idx: client.get('groupIndex'),
            e: {
                reset_sync: {
                    ...data,
                },
            },
        },
        currentClient => true
    )
}
