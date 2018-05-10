//const { UdpServer } = require('../../lib/patchwire')
const dgram = require('dgram')
const chalk = require('chalk')
const config = require('../../config')
const ByteBuffer = require('bytebuffer')

const gameManager = require('../manager/game/_manager')
const userManager = require('../manager/user/_manager')
const debugLog = require('../util/debugLog')
const CMD = require('./cmd')

const FIFTY_TICKS_PER_SECOND = 20

class UdpServer {
  constructor() {
    this.server = dgram.createSocket('udp4')
    this.tickRate = FIFTY_TICKS_PER_SECOND
    this.tickMode = true
    this.tickModeMap = {}
    this.bindEvents()
    this.startTicking()
    return this.server
  }

  bindEvents() {
    this.server.on('message', (msg, rinfo) => {
      this.logReceived(msg, rinfo)
      const buffer = ByteBuffer.wrap(msg, 'utf-8', ByteBuffer.LITTLE_ENDIAN)
      const command = buffer.readByte()
      switch (command) {
        case CMD.INIT:
          this.init(buffer, rinfo)
          break
        case CMD.SYNC:
          this.sync(buffer, rinfo)
          break
      }
    })
  }

  init(buffer, { address, port }) {
    const userId = buffer.readCString()
    const client = userManager.getClientByUserId(userId)
    if (!client) return
    client.set('udpIp', address)
    client.set('udpPort', port)
    debugLog(`Init udp connection... client address is ${address}:${port}`)
    const msg = Buffer.alloc(1)
    msg.writeInt8(CMD.UDP_SUCCESS)
    this.directSend(msg, port, address)
  }

  sync(buffer, { address, port }) {
    const groupId = buffer.readByte()
    const groupIndex = buffer.readByte()
    const room = buffer.readByte()
    const currentGroup = gameManager.getGroupByAddress(address, port)
    if (!currentGroup) {
      return
    }
    const currentClient = currentGroup.clients[groupIndex - 1]
    if (!currentClient) {
      return
    }
    currentClient.set('room', room)
    const message = buffer.slice(2).toBuffer()
    this.broadcast({
      group: currentGroup,
      client: currentClient,
      message,
      filter: client => client.get('room') === room,
    })
  }

  broadcast({ group, client, message, filter = client => true }) {
    const groupIndex = client.get('groupIndex')
    group.clients
      .filter(filter)
      .filter(currentClient => currentClient !== client)
      .map(client => [client.get('udpIp'), client.get('udpPort')])
      .forEach(([ip, udpPort]) => {
        this.send(client, message, udpPort, ip)
      })
  }

  tick() {
    Object.keys(this.tickModeMap).forEach(key => {
      const [ip, port] = key.split(':')
      const msg = this.tickModeMap[key]
      this.directSend(msg, parseInt(port), ip)
      delete this.tickModeMap[key]
    })
  }

  startTicking() {
    if (!this.tickMode) {
      throw new Error(
        'Cannot begin ticking when not in tick mode. use setTickMode(true) first.'
      )
    } else if (this.tickInterval) {
      throw new Error(
        'Cannot start ticking when already ticking. Call stopTicking() first.'
      )
    }

    this.tickInterval = setInterval(this.tick.bind(this), this.tickRate)
  }

  logReceived(msg, { address, port }) {
    debugLog(
      chalk.yellowBright(
        `Receiving from ${address}:${port}: ${JSON.stringify(
          msg.toJSON().data
        )}`
      )
    )
  }

  send(from, msg, port, ip) {
    if (!this.tickMode) {
      this.directSend(msg, port, ip)
    } else {
      const key = `${ip}:${port}`
      this.tickModeMap[key] =
        this.tickModeMap[key] === undefined
          ? msg
          : Buffer.concat([this.tickModeMap[key], msg])
    }
  }

  directSend(msg, port, ip) {
    this.server.send(msg, port, ip, () => {
      debugLog(
        chalk.greenBright(
          `Message sent to ${ip}:${port}! msg: ${JSON.stringify(
            msg.toJSON().data
          )}`
        )
      )
    })
  }
}

module.exports = new UdpServer()
