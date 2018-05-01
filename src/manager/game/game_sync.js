const gameManager = require('./_manager')
const COMMAND = require('../../command')

module.exports = (client, data) => {
  delete data.command
  gameManager.groupBroadcast(client, COMMAND.GAME_SYNC, {
    name: client.clientName,
    ...data,
  })
}
