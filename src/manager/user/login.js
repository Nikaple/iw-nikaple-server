const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const CMD = require('../../cmd')
const userManager = require('./_manager')

/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
const verifyLogin = (client, user, name, password) => {
  const userId = user._id.toString()
  if (user.authenticate(password)) {
    const loggedClient = userManager.getClientByUserId(userId)
    if (loggedClient === client) {
      client.send(CMD.LOGIN_ALREADY)
      return
    }
    if (loggedClient && loggedClient.clientName === name) {
      loggedClient.send(CMD.LOGOUT, {
        reason: 'another_device',
      })
    }
    userManager.addUser(userId, client)
    client.clientId = userId
    client.clientName = user.name
    client.ip = client.socket.remoteAddress
    client.port = client.socket.remotePort
    client.send(CMD.LOGIN_SUCCESS, {
      id: user._id,
      name: user.name,
    })
    return
  }

  client.send(CMD.LOGIN_FAILED, {
    msg: 'Wrong password!',
  })
}
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, { name, password }) => {
  User.findOne({ name }).then(user => {
    if (!user) {
      client.send(CMD.LOGIN_FAILED, {
        msg: 'Username does not exist!',
      })
      return
    }
    verifyLogin(client, user, name, password)
  })
}
