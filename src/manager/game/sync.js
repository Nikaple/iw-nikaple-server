// This is the handler for game sync

const path = require('path')

const gameManager = require('./_manager')
const CMD = require('../../cmd')
const each = require('lodash/each')
const loadHandlers = require('../../util/loadHandlers')
const eventHandlers = loadHandlers(path.resolve(__dirname, 'events'))

// 将绑定了事件处理器的事件交给事件处理器处理，处理完删除
const handleSyncEvent = (client, e) => {
    each(e, (data, event, eventMap) => {
        const handler = eventHandlers[event]
        if (handler) {
            handler(client, data, event)
            delete eventMap[event]
        }
    })
}

const defaultHandler = (client, data) => {
    gameManager.groupBroadcast(
        client,
        CMD.GAME_SYNC,
        {
            idx: client.get('groupIndex'),
            ...data,
        },
        currentClient =>
            currentClient.get('currentRoom') === client.get('currentRoom') &&
            currentClient !== client
    )
}
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data) => {
    delete data.cmd

    if (data.e) {
        // 所有事件分开处理，因为广播的对象可能不同
        handleSyncEvent(client, data.e)
        if (Object.keys(data.e).length == 0) {
            delete data.e
        }
    }

    // 将其余信息发送给同一房间中的不同玩家
    if (Object.keys(data).length > 0) {
        defaultHandler(client, data)
    }
}
