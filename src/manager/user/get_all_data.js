const { Client } = require('../../../lib/patchwire')
const CMD = require('../../cmd')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const pick = require('lodash/pick')
const isEmpty = require('lodash/isEmpty')
const compact = require('lodash/compact')
const isString = require('lodash/isString')

const extractKey = (data, key) => {
    if (key === 'updateAt') {
        return data[key] ? Date.parse(data[key]) : 0
    }
    return data[decodeURIComponent(key)]
}
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 */
module.exports = (client, { keys, id, options = '' }) => {
    if (isEmpty(keys)) {
        return client.send(CMD.DATA_GET_ALL_FAIL, {
            id,
            msg: 'keys_are_required',
        })
    }
    const dataOptions = options.split(/&/).reduce((obj, str) => {
        const [k, v] = str.split('=')
        obj[k] = v
        return obj
    }, {})
    const dataKeys = compact(decodeURIComponent(keys).split('|'))
    return User.find({})
        .then(users => {
            const {
                sortBy = 'name',
                order,
                from = 0,
                to = users.length,
            } = dataOptions
            const isDescending = order === 'desc' ? 1 : -1
            const data = users
                .map(user => ({
                    name: user.name,
                    ...pick(user.data, dataKeys),
                }))
                .sort((prev, cur) => {
                    const prevKey = extractKey(prev, sortBy)
                    const curKey = extractKey(cur, sortBy)
                    return prevKey < curKey ? isDescending : -isDescending
                })
                .slice(from, to)

            return client.send(CMD.DATA_GET_ALL_SUCCESS, { id, data })
        })
        .catch(_ => {
            return client.send(CMD.DATA_GET_ALL_FAIL, {
                id,
                msg: 'data_not_found',
            })
        })
}
