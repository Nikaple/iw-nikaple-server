// Load all managers from folder `manager`

const fs = require('fs')
const path = require('path')
const { ClientManager } = require('../lib/patchwire')
const managerFolder = path.join(__dirname, 'manager')
const loadHandler = require('./util/loadHandlers')

const loadManager = managersPath => {
    const managerPaths = fs.readdirSync(managersPath)
    const managers = managerPaths.reduce((managers, name) => {
        const managerPath = path.join(managersPath, name)
        const managerFile = path.join(managerPath, '_manager.js')
        const currentManager = fs.existsSync(managerFile)
            ? require(managerFile)
            : new ClientManager()
        const currentHandlers = loadHandler(managerPath)
        Object.keys(currentHandlers).forEach(cmdName => {
            currentManager.addCommandListener(cmdName, currentHandlers[cmdName])
        })
        managers[name] = currentManager
        return managers
    }, {})
    return managers
}

module.exports = loadManager(managerFolder)
