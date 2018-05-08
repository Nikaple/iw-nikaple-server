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
  if (!userManager.getClients().includes(client)) {
    client.send(COMMAND.LOGIN_NEEDED)
    return
  }
  userManager.removeClient(client.clientId)
  client.send(COMMAND.LOGOUT, {
    reason: 'user_intent',
  })
}
