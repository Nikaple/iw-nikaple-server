const { Server } = require('./lib/patchwire')
const mongoose = require('mongoose')
const fs = require('fs')
const { join } = require('path')
const config = require('./config')
const syncServer = require('./src/server/sync')

const models = join(__dirname, 'src/model')
const connection = connect()

connection
  .once('connected', listen)
  .on('disconnected', () => setTimeout(connect, config.dbReconnectInterval))

// Bootstrap models
fs
  .readdirSync(models)
  .filter(file => file.includes('.js'))
  .forEach(file => require(join(models, file)))

const managers = require('./src/managers')
const server = new Server(function(client) {
  managers.lobby.addClient(client)
  managers.user.addClient(client)
})

function listen() {
  server.listen(config.port, function() {
    console.info(`IW nikaple server is running at port: ${config.port}`)
  })
  syncServer.bind(config.port, () => {
    console.log(`SyncServer listening on port: ${config.port}`)
  })
}

function connect() {
  mongoose.connect(config.db).catch(err => {
    console.log('Mongo connection error... Reconnecting...')
  })
  return mongoose.connection
}
