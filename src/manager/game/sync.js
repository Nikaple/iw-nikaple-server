// This is the handler for game sync

const gameManager = require('./_manager')
const CMD = require('../../cmd')
const mapValues = require('lodash/mapValues')
const each = require('lodash/each')
const handleSyncEvent = (client, e) => {
  return mapValues(e, (data, event) => {
    switch (event) {
      case 'warp':
        return handleWarpEvent(client, data)
      case 'warp_wait':
        return handleWarpWaitEvent(client, data)
      case 'save_sync':
        return handleSaveSyncEvent(client, data)
      default:
        return data
    }
  })
}

const handleWarpEvent = (client, data) => {
  const room = data.roomTo
  if (room !== '') {
    client.set('currentRoom', room)
  }
  client.set('filter', currentClient => currentClient !== client)
  // clear warp flag
  each(client.data, (_, key) => {
    if (key.startsWith('warp-')) {
      client.set(key, false)
    }
  })
  return data
}

const handleWarpWaitEvent = (client, data) => {
  const { room, roomTo } = data
  const warpFlag = `warp-${room}-${roomTo}`
  client.set(warpFlag, true)
  const group = gameManager.getGroupByClientId(client.clientId)
  const clients = group.clients
  const IsAllPlayersInWarp = clients.every(
    client => client.get(warpFlag) === true
  )
  if (IsAllPlayersInWarp) {
    clients.forEach(client => {
      client.set(warpFlag, false)
    })
    client.set('filter', client => true)
    return { fin: 1, ...data }
  }
  return data
}

const handleSaveSyncEvent = (client, data) => {
  client.set('filter', currentClient => currentClient !== client)
  return data
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
    data.e = handleSyncEvent(client, data.e)
  }

  const currentRoom = client.get('currentRoom')
  // 发送给同一房间中的不同玩家
  const defaultFilter = currentClient =>
    currentClient.get('currentRoom') === currentRoom && currentClient !== client
  const filter = client.get('filter') || defaultFilter
  gameManager.groupBroadcast(
    client,
    CMD.GAME_SYNC,
    {
      idx: client.get('groupIndex'),
      ...data,
    },
    filter
  )
  client.set('filter', undefined)
}
