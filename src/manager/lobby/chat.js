const lobbyManager = require('./_manager')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data) => {
    lobbyManager.broadcast('chat', {
        from: data.name,
        msg: data.msg,
    })
}
