const gameManager = require('./_manager')
const COMMAND = require('../../command')

module.exports = (client, data) => {
  delete data.command
  const room = (data && data.player && data.player.room) || ''
  if (room !== '') {
    client.set('currentRoom', data.player.room)
  }
  const currentRoom = client.get('currentRoom')
  gameManager.groupBroadcast(
    client,
    COMMAND.GAME_SYNC,
    {
      name: client.clientName,
      ...data,
    },
    client => {
      if (data.event && data.event.warp) {
        return true
      }
      return client.get('currentRoom') === currentRoom
    }
  )
}
