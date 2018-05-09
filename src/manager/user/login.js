const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const CMD = require('../../cmd')
const userManager = require('./_manager')

const toIPv4 = ipv6OrIpv4 => {
  if (ipv6OrIpv4.startsWith('::ffff:')) {
    return ipv6OrIpv4.slice(7)
  }
  return ipv6OrIpv4
}

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
module.exports = (client, { name, password, udp_port }) => {
  User.findOne({ name }).then(user => {
    if (!user) {
      client.send(CMD.LOGIN_FAILED, {
        msg: 'Username does not exist!',
      })
      return
    }
    verifyLogin(client, user, name, password)
    client.set('ip', toIPv4(client.socket.remoteAddress))
    client.set('udpPort', udp_port)
  })
}
