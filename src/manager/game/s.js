// This is the handler for game sync

const gameManager = require('./_manager')
const CMD = require('../../cmd')
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data) => {
  delete data.cmd
  const room = (data && data.player && data.player.room) || ''
  if (room !== '') {
    client.set('currentRoom', data.player.room)
  }
  const currentRoom = client.get('currentRoom')
  gameManager.groupBroadcast(
    client,
    CMD.GAME_SYNC,
    {
      idx: client.get('groupIndex'),
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
