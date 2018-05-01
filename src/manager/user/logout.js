const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const COMMAND = require('../../command')
const userManager = require('./_manager')

/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.command
 */
module.exports = (client, data) => {
  client.send(COMMAND.LOGOUT, {
    msg: 'Successfully logout!',
  })
}
