'use strict'

const ONE_SECOND = 1000
const DEFAULT_TICKS_PER_SECOND = 60
const DEBUG_MODE = process.env.GM_SERVER_DEBUG === 'true'

class ClientManager {
  constructor() {
    this.clients = []
    this.cmdHandlers = {}
    this.eventHandlers = {}
    this.persistedData = {}
    this.tickMode = false
    this.tickRate = ONE_SECOND / DEFAULT_TICKS_PER_SECOND
    this.tickInterval
  }

  /**
   * Returns the list of clients in this ClientManager
   * @return {array} A list of Client instances
   */
  getClients() {
    return this.clients
  }

  /**
   * Returns the number of clients in this ClientManager
   * @return {number} The number of clients in this ClientManager
   */
  getClientCount() {
    return this.clients.length
  }

  /**
   * Sets an arbitrary value on this instance
   * @param {string} key  The key of the value to set
   * @param {mixed} value The value to save
   */
  set(key, value) {
    this.persistedData[key] = value
  }

  /**
   * Gets a value set from .set
   * @param  {string} key The key to retrieve
   * @return {mixed}      The data with at the given key
   */
  get(key) {
    return this.persistedData[key]
  }

  /**
   * Adds a client to this ClientManager
   * @param {Client} client The client to add to the manager
   */
  addClient(client) {
    client.setTickMode(this.tickMode)

    client.onData(data => {
      this.handleIncomingCommand(client, data)
    })

    client.on('close', () => {
      this.fire('clientDropped', client)
      this.removeClient(client.clientId)
    })

    client.on('error', error => {
      if (error.code !== 'ECONNRESET') {
        console.log(error)
      }
    })

    this.clients.push(client)
    this.fire('clientAdded', client)
  }

  /**
   * Removes a client from this ClientManager based on the given client ID
   * @param  {number} clientId The ID of the client to remove (as found on Client.clientId)
   * @return {Client}          The client that was removed
   */
  removeClient(clientId) {
    const removed = this.clients.filter(client => client.clientId === clientId)
    this.clients = this.clients.filter(client => client.clientId !== clientId)

    if (removed.length > 0) {
      return removed[0]
    } else {
      return undefined
    }
  }

  /**
   * Sends a cmd to every Client in this ClientManager
   * @param  {object} data               The cmd data object
   * @param  {function} filter           The function to filter clients
   *
   */
  broadcast(cmd, data) {
    if (typeof data === 'undefined') {
      data = cmd
    } else {
      data.cmd = cmd
    }

    this.clients.forEach(client => {
      client.send(data)
    })
  }

  /**
   * Routes an incoming cmd to the proper handler.
   * Meant for internal use.
   * @param  {Client} client The client that sent the cmd
   * @param  {object} data   The cmd data object
   */
  handleIncomingCommand(client, data) {
    this.fire('cmdReceived', { client: client, data: data })

    if (this.cmdHandlers.hasOwnProperty(data.cmd)) {
      this.cmdHandlers[data.cmd].forEach(handler => {
        handler(client, data)
      })
    }
  }

  /**
   * Registers a callback function for when a given cmd is sent in by a client
   * @param {string} cmd   The cmd to listen for
   * @param {function} handler A callback to run when the cmd is received
   */
  addCommandListener(cmd, handler) {
    // If there is a cmd listener for this cmd already, push.
    if (this.cmdHandlers.hasOwnProperty(cmd)) {
      this.cmdHandlers[cmd].push(handler)
    } else {
      this.cmdHandlers[cmd] = [handler]
    }
  }

  /**
   * Registers an event handler for ClientManager events
   * @param  {string} eventName The event to listen for
   * @param  {function} handler The handling function for this event
   */
  on(eventName, handler) {
    // If there is a event listener for this event already, push.
    if (this.eventHandlers.hasOwnProperty(eventName)) {
      this.eventHandlers.push(handler)
    } else {
      this.eventHandlers[eventName] = [handler]
    }
  }

  /**
   * Fires an event on this ClientManager
   * @param  {string} eventName The name of the event
   * @param  {object} data      The data associated with this event
   */
  fire(eventName, data) {
    if (this.eventHandlers.hasOwnProperty(eventName)) {
      this.eventHandlers[eventName].forEach(function(handler) {
        if (typeof data !== 'undefined') {
          handler(data)
        } else {
          handler()
        }
      })
    }
  }

  /**
   * Enables or disables tick mode
   * When you disable tick mode through this function, ticking will stop if previously started
   * @param {boolean} onOff true to enable, false to disable
   */
  setTickMode(onOff) {
    this.tickMode = onOff

    this.clients.forEach(function(client) {
      client.setTickMode(onOff)
    })

    if (onOff === false) {
      this.stopTicking()
    }
  }

  /**
   * Set the rate that ticks happen in ms. Default is to tick 60 times per second.
   * Cannot be set if already ticking.
   * @param {number} newTickRate The time in ms between ticks
   */
  setTickRate(newTickRate) {
    if (this.tickInterval) {
      throw new Error(
        'Cannot change tick rate while already ticking. Call stopTicking() first.'
      )
    }

    this.tickRate = newTickRate
  }

  /**
   * Begins ticking when in tick mode.
   */
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

  /**
   * Stops ticking when in tick mode.
   */
  stopTicking() {
    clearInterval(this.tickInterval)
    this.tickInterval = undefined
  }

  /**
   * Calls tick() on every Client in this ClientManager, sending out all stored cmds.
   */
  tick() {
    this.fire('tick')
    this.clients.forEach(function(client) {
      client.tick()
    })
  }
}

module.exports = ClientManager
