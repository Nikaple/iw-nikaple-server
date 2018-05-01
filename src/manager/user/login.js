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
  const { name, password } = data

  User.findOne({ name }).then(user => {
    if (!user) {
      client.send(COMMAND.LOGIN_FAILED, {
        msg: 'Username does not exist!',
      })
      return
    }
    const userId = user._id.toString()
    if (user.authenticate(password)) {
      const loggedClient = userManager.getClientByUserId(userId)
      if (loggedClient) {
        loggedClient.send(COMMAND.LOGOUT, {
          msg: 'Login from another device',
        })
      }
      userManager.addUser(userId, client)
      client.clientId = userId
      client.clientName = user.name
      client.send(COMMAND.LOGIN_SUCCESS, {
        id: user._id,
        name: user.name,
      })
    } else {
      client.send(COMMAND.LOGIN_FAILED, {
        msg: 'Wrong password!',
      })
    }
  })
}
