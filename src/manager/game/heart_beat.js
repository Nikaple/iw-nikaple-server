const { Client } = require('../../../lib/patchwire')
const CMD = require('../../cmd')

/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data) => {
    client.set('heartbeat', 0)
}
