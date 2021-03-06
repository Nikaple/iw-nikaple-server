class Lobby {
    constructor({ id, name, mode, password, host }) {
        this.id = id
        this.name = name
        this.mode = mode
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

    broadcast(cmd, data, filter = () => true) {
        if (typeof data === 'undefined') {
            data = cmd
        } else {
            data.cmd = cmd
        }

        this.getClients()
            .filter(filter)
            .forEach(client => {
                client.send(data)
            })
    }
}

module.exports = Lobby
