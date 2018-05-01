// Load all managers from folder `manager`

const fs = require('fs')
const path = require('path')
const { ClientManager } = require('../lib/patchwire')
const managerFolder = path.join(__dirname, 'manager')

const loadHandler = managerPath => {
  const handlerNames = fs.readdirSync(managerPath)
  return handlerNames.reduce((handlers, name) => {
    const handlerName = name.split('.')[0]
    handlers[handlerName] = require(path.resolve(managerPath, name))
    return handlers
  }, {})
}

const loadManager = managersPath => {
  const managerPaths = fs.readdirSync(managersPath)
  const managers = managerPaths.reduce((managers, name) => {
    const managerPath = path.join(managersPath, name)
    const managerFile = path.join(managerPath, '_manager.js')
    const currentManager = fs.existsSync(managerFile)
      ? require(managerFile)
      : new ClientManager()
    const currentHandlers = loadHandler(managerPath)
    Object.keys(currentHandlers).forEach(commandName => {
      currentManager.addCommandListener(
        commandName,
        currentHandlers[commandName]
      )
    })
    managers[name] = currentManager
    return managers
  }, {})
  return managers
}

module.exports = loadManager(managerFolder)
