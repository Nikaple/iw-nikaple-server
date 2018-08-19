const userManager = require('./_manager')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data) => {
    userManager.broadcast('chat', {
        from: client.clientName,
        msg: data.msg,
    })
}
