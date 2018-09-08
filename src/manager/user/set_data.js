const { Client } = require('../../../lib/patchwire')
// const gameManager = require('../_manager')
const CMD = require('../../cmd')
const mongoose = require('mongoose')
const User = mongoose.model('User')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 */
module.exports = (client, { id, data }) => {
    const { clientId } = client
    User.findById(clientId)
        .then(user => {
            user.data = {
                ...user.data,
                ...data,
                updateAt: new Date().toLocaleString()
            }
            if (!user.data.createAt) {
                user.data.createAt = new Date().toLocaleString()
            }
            return user.save()
        })
        .then(_ => {
            return client.send(CMD.DATA_SET_SUCCESS, { id, data })
        })
        .catch(_ => {
            return client.send(CMD.DATA_SET_FAIL, {
                id,
                msg: 'login_needed',
            })
        })
}
