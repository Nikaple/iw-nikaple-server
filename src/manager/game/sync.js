// This is the handler for game sync

const path = require('path')

const gameManager = require('./_manager')
const CMD = require('../../cmd')
const each = require('lodash/each')
const loadHandlers = require('../../util/loadHandlers')
const { SCOPE, getFilter } = require('../../util/getFilter')

const eventHandlers = loadHandlers(path.resolve(__dirname, 'events'))

// 将绑定了事件处理器的事件交给事件处理器处理，处理完删除
const handleSyncEvent = (client, e) => {
    each(e, (data, event, eventMap) => {
        const handler = eventHandlers[event] || defaultEventHandler
        handler(client, data, event)
        delete eventMap[event]
    })
}

// echo back
const defaultEventHandler = (client, data, event) => {
    const { scope = SCOPE.DEFAULT } = data
    const filter = getFilter(client)[scope]
    delete data.scope
    gameManager.groupBroadcast(
        client,
        CMD.GAME_SYNC,
        {
            e: {
                [event]: {
                    ...data,
                },
            },
        },
        filter
    )
}

// echo back
const defaultHandler = (client, data) => {
    const { scope = SCOPE.DEFAULT } = data
    const filter = getFilter(client)[scope]
    delete data.scope
    gameManager.groupBroadcast(client, CMD.GAME_SYNC, data, filter)
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
        // 处理特殊事件
        handleSyncEvent(client, data.e)
        if (Object.keys(data.e).length == 0) {
            delete data.e
        }
    }

    if (Object.keys(data).length > 0) {
        defaultHandler(client, data)
    }
}
