const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const COMMAND = require('../../command')

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
    if (user) {
      client.send(COMMAND.REGISTER_FAILED, {
        msg: 'Username already exists!',
      })
      return
    }
    const newUser = new User({ name, password, skipValidation: true })
    newUser.save().then(user => {
      client.clientId = user._id.toString()
      client.send(COMMAND.REGISTER_SUCCESS, {
        id: client.clientId,
        name,
      })
    })
  })
}
