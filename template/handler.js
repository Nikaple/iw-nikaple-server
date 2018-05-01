const { Client } = require('../../../lib/patchwire')
const COMMAND = require('../../command')

/**
 *
 *
 * @param {Client} socket
 * @param {object} data
 * @param {string} data.command
 */
module.exports = (socket, data) => {
  socket.send(COMMAND.YOUR_COMMAND, {})
}
