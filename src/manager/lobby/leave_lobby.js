const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const lobbyManager = require('./_manager')
const COMMAND = require('../../command')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.command
 */
module.exports = client => {
  lobbyManager.leaveLobby(client)
}
