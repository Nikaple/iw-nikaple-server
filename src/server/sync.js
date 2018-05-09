//const { UdpServer } = require('../../lib/patchwire')
const dgram = require('dgram')
const chalk = require('chalk')
const config = require('../../config')
const ByteBuffer = require('bytebuffer')

const gameManager = require('../manager/game/_manager')
const userManager = require('../manager/user/_manager')
const udpServer = dgram.createSocket('udp4')
const DEBUG_MODE = process.env.GM_SERVER_DEBUG === 'true'
const CMD = require('./cmd')
class UdpServer {
  constructor() {
    this.server = dgram.createSocket('udp4')
    this.bindEvents()
    return this.server
  }

  bindEvents() {
    this.server.on('message', (msg, rinfo) => {
      console.log(
        chalk.yellowBright(
          `Receiving from ${rinfo.address}:${rinfo.port}: ${JSON.stringify(
            msg.toJSON()
          )}`
        )
      )
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
    client.set('udpIP', address)
    client.set('udpPort', port)
    const byteBuffer = new ByteBuffer(1)
    byteBuffer.writeByte(1)
  }

  sync(buffer, { address, port }) {
    const groupId = buffer.readByte()
    const groupIndex = buffer.readByte()
    const room = buffer.readByte()
    const currentGroup = gameManager.getGroupByIp(address)
    if (!currentGroup) {
      return
    }
    const message = buffer.slice(2).toBuffer()
    currentGroup.clients
      .map(client => [
        client.get('udpIp') || client.get('ip'),
        client.get('udpPort'),
      ])
      .filter(([ip, udpPort]) => ip !== address || port !== udpPort)
      .forEach(([ip, udpPort]) => {
        udpServer.send(message, udpPort, ip, () => {
          console.log(
            chalk.greenBright(
              `   Msg sent to ${ip}:${udpPort}: ${JSON.stringify(
                message.toJSON()
              )}`
            )
          )
        })
      })
  }
}

module.exports = new UdpServer()
