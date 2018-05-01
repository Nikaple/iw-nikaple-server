const { ClientManager } = require('../../../lib/patchwire')
const ERROR = require('../../error')
const COMMAND = require('../../command')

class UserManager extends ClientManager {
  constructor() {
    super()
    this.authenticatedUser = {}
  }

  addUser(userId, client) {
    this.authenticatedUser[userId] = client
  }

  removeUser(userId) {
    delete this.authenticatedUser[userId]
  }

  getClientByUserId(userId) {
    return this.authenticatedUser[userId]
  }
}

const userManager = new UserManager()
module.exports = userManager
