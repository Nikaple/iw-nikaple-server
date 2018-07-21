'use strict'

const zlib = require('zlib')
const { promisify } = require('util')

const ByteBuffer = require('bytebuffer')
const chalk = require('chalk')

const _ = require('./util')
const TERMINATING_CHARACTER = '\n'
const DEBUG_MODE = process.env.GM_SERVER_DEBUG === 'true'

class Client {
    constructor(socket) {
        this.socket = socket
        this.dataHandlers = []
        this.clientId = _.uniqueId()
        this.created = Date.now()
        this.data = {}
        this.flags = {}
        this.tickMode = false
        this.tickModeQueue = []

        socket.on('data', data => {
            const dataAsObject = Client.getObjectFromRaw(data)

            if (DEBUG_MODE) {
                console.info(
                    `Receiving from ${chalk.blueBright(
                        this.clientName || 'guest'
                    )}: ${chalk.blueBright(JSON.stringify(dataAsObject))})}`
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
                `Sending to     ${chalk.greenBright(
                    this.clientName || 'guest'
                )}: ${chalk.greenBright(JSON.stringify(cmd))}`
            )
        }
        const cmdJson = JSON.stringify(cmd)
        // As the commands are really short, using deflate will cost more.
        // const compressedBuffer = zlib.deflateSync(Buffer.from(cmdJson, 'ascii'))
        // http dll 2 generates an extra '\0' at the end of deflated string
        // const response = Buffer.concat([compressedBuffer, Buffer.from('\0\n')])
        this.socket.write(cmdJson + TERMINATING_CHARACTER)
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
     * Sets an flag on this object
     * @param {string} key
     * @param {mixed} value
     */
    setFlag(key) {
        this.flags[key] = true
    }

    /**
     *  an flag on this object
     * @param {string} key
     * @param {mixed} value
     */
    deleteFlag(key) {
        this.flags[key] = false
    }

    /**
     * Returns a flag on this object
     * @param  {string} key
     * @return {mixed}
     */
    getFlag(key) {
        return this.flags[key]
    }

    /**
     * reset all flags
     * @param {string} key
     * @param {mixed} value
     */
    resetFlags(key, value) {
        this.flags = {}
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
        // As the commands are really short, using deflate will cost more.
        /*
        const inflate = promisify(zlib.inflate)
        return inflate(data)
            .then(uncompressed => {
                const json = uncompressed.toString()
                const objectFromData = JSON.parse(json)
                return objectFromData
            })
            .catch(err => {
                return {}
            })
        */
        try {
            return JSON.parse(data.toString())
        } catch (err) {
            return {}
        }
    }
}

module.exports = Client
