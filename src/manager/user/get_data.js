const { Client } = require('../../../lib/patchwire')
const CMD = require('../../cmd')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const pick = require('lodash/pick')
const compact = require('lodash/compact')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 */
module.exports = (client, { keys, id }) => {
    const { clientId } = client
    const dataKeys = compact(decodeURIComponent(keys).split('|'))
    User.findById(clientId)
        .then(user => {
            const data =
                dataKeys.length === 0 ? user.data : pick(user.data, dataKeys)
            return client.send(CMD.DATA_GET_SUCCESS, { data, id })
        })
        .catch(_ => {
            return client.send(CMD.DATA_GET_FAIL, { id, msg: 'data_not_found' })
        })
}
