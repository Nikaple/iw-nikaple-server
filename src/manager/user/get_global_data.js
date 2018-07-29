const { Client } = require('../../../lib/patchwire')
// const gameManager = require('../_manager')
const CMD = require('../../cmd')
const { globalData } = require('../../../config')
const compact = require('lodash/compact')
const pick = require('lodash/pick')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 */
module.exports = (client, { keys, id }) => {
    const dataKeys = compact(decodeURIComponent(keys).split('|'))
    const data = dataKeys.length === 0 ? globalData : pick(globalData, dataKeys)
    if (Object.keys(data).length === 0) {
        return client.send(CMD.DATA_GET_FAIL, { id, msg: 'key_does_not_exist' })
    }
    return client.send(CMD.DATA_GET_SUCCESS, { id, data })
}
