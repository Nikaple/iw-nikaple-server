'use strict'

const _ = require('./util')
const chalk = require('chalk')
const TERMINATING_CHARACTER = '\0'
const DEBUG_MODE = process.env.GM_SERVER_DEBUG === 'true'

class Client {
  constructor(socket) {
    this.socket = socket
    this.dataHandlers = []
    this.clientId = _.uniqueId()
    this.created = Date.now()
    this.data = {}
    this.tickMode = false
    this.tickModeQueue = []

    socket.on('data', data => {
      const dataAsObject = Client.getObjectFromRaw(data)

      if (DEBUG_MODE) {
        console.info(
          'Receiving from',
          chalk.blueBright(this.clientId),
          ': ',
          chalk.blueBright(JSON.stringify(dataAsObject))
        )
      }

      this.dataHandlers.forEach(handler => {
        handler(dataAsObject)
      })
    })

    this.send({
      cmd: 'connected',
    })
  }

  /**
   * Sends a cmd.
   * @param  {string} cmd The name of the cmd
   * @param {object} cmd
   */
  send(cmd, data) {
    if (typeof data === 'undefined') {
      data = _.isString(cmd) ? { cmd } : cmd
    } else {
      data.cmd = cmd
    }

    if (this.tickMode) {
      // If this is a batch send, put all of the cmds into the queue.
      if (data.b) {
        data.cmds.forEach(cmd => {
          this.tickModeQueue.push(cmd)
        })
      } else {
        this.tickModeQueue.push(data)
      }
    } else {
      this.directSend(data)
    }
  }

  /**
   * Directly writes to the wire
   * @param  {object} cmd
   */
  directSend(cmd) {
    if (DEBUG_MODE) {
      console.info(
        'Sending to    ',
        chalk.greenBright(this.clientId),
        ': ',
        chalk.greenBright(JSON.stringify(cmd))
      )
    }
    this.socket.write(JSON.stringify(cmd) + '\r\n')
  }

  /**
   * Sends a list of cmds together at once
   * @param  {array} cmdList
   */
  batchSend(cmdList) {
    this.send({
      batch: 1,
      cmds: cmdList,
    })
  }

  /**
   * Sets an arbitrary value on this object
   * @param {string} key
   * @param {mixed} value
   */
  set(key, value) {
    this.data[key] = value
  }

  /**
   * Returns stored data on this object
   * @param  {string} key
   * @return {mixed}
   */
  get(key) {
    return this.data[key]
  }

  /**
   * Registers an event handler on the underlying socket of this client
   * @param  {string} eventName
   * @param  {function} handler
   */
  on(eventName, handler) {
    this.socket.on(eventName, handler)
  }

  /**
   * Registers a handler for when this socket receives data
   * @param  {function} handler
   */
  onData(handler) {
    this.dataHandlers.push(handler)
  }

  /**
   * Sets tick mode on or off.
   * @param {boolean} onOff
   */
  setTickMode(onOff) {
    this.tickMode = onOff
  }

  /**
   * Sends all stored cmds when in tick mode
   */
  tick() {
    if (!this.tickMode) {
      throw new Error('Cannot tick when not in tick mode')
    }

    if (this.tickModeQueue.length !== 0) {
      const cmd =
        this.tickModeQueue.length === 1
          ? this.tickModeQueue[0]
          : {
              batch: 1,
              cmds: this.tickModeQueue,
            }

      this.directSend(cmd)
      this.tickModeQueue = []
    }
  }

  /**
   * Gets a javascript object from an input buffer containing json
   * @param  {Buffer} data
   * @return {object}
   */
  static getObjectFromRaw(data) {
    const rawSocketDataString = data.toString('ascii')
    const terminatingIndex = rawSocketDataString.indexOf(TERMINATING_CHARACTER)
    let trimmedData
    if (terminatingIndex > -1) {
      trimmedData = rawSocketDataString.substr(0, terminatingIndex)
    } else {
      trimmedData = rawSocketDataString
    }
    if (trimmedData == null || trimmedData.trim() == '') {
      trimmedData = '{"cmd": "missingSocketDataString"}'
    }
    const objectFromData = JSON.parse(trimmedData)
    return objectFromData
  }
}

module.exports = Client
