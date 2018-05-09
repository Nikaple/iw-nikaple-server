const { Client } = require('../../../lib/patchwire')
const CMD = require('../../cmd')

/**
 *
 *
 * @param {Client} socket
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (socket, data) => {
  socket.send(CMD.YOUR_CMD, {})
}
