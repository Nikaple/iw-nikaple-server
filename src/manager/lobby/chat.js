const lobbyManager = require('./_manager')

module.exports = (client, data) => {
  lobbyManager.broadcast('chat', {
    from: data.id,
    msg: data.msg,
  })
}
