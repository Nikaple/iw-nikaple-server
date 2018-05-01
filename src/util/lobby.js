class Lobby {
  constructor({ id, name, password, host }) {
    this.id = id
    this.name = name
    this.password = password
    this.host = host
    this.guests = []
  }

  addGuest(guest) {
    this.guests = this.guests.concat(guest)
  }

  getClients() {
    return [this.host, ...this.guests]
  }

  broadcast(command, data) {
    if (typeof data === 'undefined') {
      data = command
    } else {
      data.command = command
    }

    this.getClients().forEach(client => {
      client.send(data)
    })
  }
}

module.exports = Lobby
