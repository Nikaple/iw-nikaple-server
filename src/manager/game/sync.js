// This is the handler for game sync

const gameManager = require('./_manager')
const dlv = require('dlv')
const CMD = require('../../cmd')

const handleSyncEvent = (client, e) => {
  Object.keys(e).forEach(event => {
    switch (event) {
      case 'warp':
        handleWarpEvent(client, event)
        break
      default:
        break
    }
  })
}

const handleWarpEvent = (client, event) => {
  const room = event.roomTo
  if (room !== '') {
    client.set('currentRoom', room)
  }
  const currentRoom = client.get('currentRoom')
  gameManager.groupBroadcast(client, CMD.GAME_SYNC, {
    idx: client.get('groupIndex'),
    e: { ...event },
  })
}
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data) => {
  delete data.cmd

  if (data.e) {
    handleSyncEvent(client, data.e)
    delete data.e
  }

  const currentRoom = client.get('currentRoom')
  gameManager.groupBroadcast(
    client,
    CMD.GAME_SYNC,
    {
      idx: client.get('groupIndex'),
      ...data,
    },
    // 发送给同一房间中的不同玩家
    currentClient =>
      currentClient.get('currentRoom') === currentRoom &&
      currentClient !== client
  )
}
