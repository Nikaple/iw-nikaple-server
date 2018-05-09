const { Client } = require('../../../lib/patchwire')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const lobbyManager = require('./_manager')
const CMD = require('../../cmd')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = client => {
  lobbyManager.leaveLobby(client)
}
