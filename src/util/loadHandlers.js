const fs = require('fs')
const path = require('path')

const loadHandlers = handlerPath => {
    const handlerNames = fs.readdirSync(handlerPath)
    return handlerNames.reduce((handlers, name) => {
        const [handlerName, ext] = name.split('.')
        if (ext == 'js') {
            handlers[handlerName] = require(path.resolve(handlerPath, name))
        }
        return handlers
    }, {})
}

module.exports = loadHandlers
