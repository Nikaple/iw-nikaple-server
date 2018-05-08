const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const COMMAND = require('../../command')
const userManager = require('./_manager')

const verifyLogin = (client, user, name, password) => {
  const userId = user._id.toString()
  if (user.authenticate(password)) {
    const loggedClient = userManager.getClientByUserId(userId)
    if (loggedClient === client) {
      client.send(COMMAND.LOGIN_ALREADY)
      return
    }
    if (loggedClient && loggedClient.clientName === name) {
      loggedClient.send(COMMAND.LOGOUT, {
        reason: 'another_device',
      })
    }
    userManager.addUser(userId, client)
    client.clientId = userId
    client.clientName = user.name
    client.send(COMMAND.LOGIN_SUCCESS, {
      id: user._id,
      name: user.name,
    })
    return
  }

  client.send(COMMAND.LOGIN_FAILED, {
    msg: 'Wrong password!',
  })
}
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.command
 */
module.exports = (client, { name, password }) => {
  User.findOne({ name }).then(user => {
    if (!user) {
      client.send(COMMAND.LOGIN_FAILED, {
        msg: 'Username does not exist!',
      })
      return
    }
    verifyLogin(client, user, name, password)
  })
}
