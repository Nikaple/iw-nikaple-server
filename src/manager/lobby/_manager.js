const { ClientManager, Client } = require('../../../lib/patchwire')
const ERROR = require('../../error')
const CMD = require('../../cmd')
const Lobby = require('../../util/lobby')
const config = require('../../../config')

class LobbyManager extends ClientManager {
    constructor() {
        super()
        this.currentIndex = 100
        this.lobbies = {}
    }

    /**
     * Finds an empty lobby index
     *
     * @returns
     * @memberof LobbyManager
     */
    getAvailableIndex() {
        this.currentIndex =
            this.currentIndex + 1 + Math.floor(2 * Math.random())
        return this.currentIndex
    }

    /**
     * Adds a lobby to current manager
     *
     * @memberof LobbyManager
     */
    addLobby(lobbyData) {
        const lobbyIndex = this.getAvailableIndex()
        const currentLobby = new Lobby({
            ...lobbyData,
            id: lobbyIndex,
        })
        this.lobbies[lobbyIndex] = currentLobby
        return currentLobby
    }

    /**
     * Check if the client is logged in
     *
     * @param {Client} client
     * @returns
     * @memberof LobbyManager
     */
    checkLogin(client) {
        if (!client.clientName) {
            client.send(CMD.LOGIN_NEEDED)
            throw Error()
        }
        return true
    }

    /**
     * Check is password is same as lobby's password
     *
     * @param {Client} client
     * @param {Lobby} lobby
     * @param {String} password
     * @returns
     * @memberof LobbyManager
     */
    checkPassword(client, lobby, password) {
        if (password !== lobby.password) {
            client.send(CMD.LOBBY_PASS_NOT_VALID)
            throw Error()
        }
        return true
    }

    /**
     * Check if current client is in the lobby before leave
     *
     * @param {Client} client
     * @param {Lobby} lobby
     * @returns
     * @memberof LobbyManager
     */
    checkAlreadyInLobbyBeforeLeave(client, lobby) {
        if (!lobby.getClients().includes(client)) {
            client.send(CMD.UNKNOWN_ERROR)
            throw Error()
        }
        return true
    }

    /**
     * Check if current client is in the lobby before join
     *
     * @param {Client} client
     * @param {Lobby} lobby
     * @returns
     * @memberof LobbyManager
     */
    checkAlreadyInLobbyBeforeJoin(client, lobby) {
        if (lobby.getClients().includes(client)) {
            client.send(CMD.LOBBY_SAME_ID)
            throw Error()
        }
        return true
    }

    /**
     * Check is current lobby is full
     *
     * @param {Client} client
     * @param {Lobby} lobby
     * @returns
     * @memberof LobbyManager
     */
    checkLobbyIsFull(client, lobby) {
        if (lobby.getClients().length >= config.maxLobbyPlayers) {
            client.send(CMD.LOBBY_IS_FULL)
            throw Error()
        }
        return true
    }

    /**
     * Remove a client
     *
     * @param {Client} clients
     * @memberof LobbyManager
     */
    removeClients(clients) {
        this.clients = this.clients.filter(client => !clients.includes(client))
    }

    /**
     * Gets the current lobby id of client
     *
     * @param {Client} client
     * @returns
     * @memberof LobbyManager
     */
    getCurrentLobbyId(client, isSilent) {
        const currentLobbyId = client.get('currentLobbyId')
        if (!currentLobbyId) {
            if (!isSilent) {
                client.send(CMD.LOBBY_NOT_FOUND)
            }
            throw Error()
        }
        return currentLobbyId
    }

    /**
     * Gets the lobby by lobby id
     *
     * @param {Client} lobbyId
     * @returns
     * @memberof LobbyManager
     */
    getLobbyById(lobbyId, isSilent) {
        const lobby = lobbyManager.lobbies[lobbyId]
        if (!lobby) {
            if (!isSilent) {
                client.send(CMD.LOBBY_NOT_EXISTS)
            }
            throw Error()
        }
        return lobby
    }

    /**
     * Create a lobby
     *
     * @param {Client} client
     * @param {Object} { name, password, client }
     * @returns {Lobby} Lobby created
     * @memberof LobbyManager
     */
    createLobby(client, lobbyData) {
        try {
            this.checkLogin(client)
            this.leaveLobbyWithoutId(client)
            const currentLobby = this.addLobby(lobbyData)
            return currentLobby
        } catch (err) {
            return null
        }
    }

    /**
     * Join a lobby
     *
     * @param {Client} client
     * @param {Object} { id, password, guest }
     * @returns lobby joined if successful
     * @memberof LobbyManager
     */
    joinLobby(client, { id, password, guest }) {
        try {
            this.checkLogin(client)
            const lobby = this.getLobbyById(id)
            this.checkPassword(client, lobby, password)
            this.checkAlreadyInLobbyBeforeJoin(client, lobby)
            this.checkLobbyIsFull(client, lobby)
            lobby.addGuest(guest)
            return lobby
        } catch (err) {
            return null
        }
    }

    /**
     * Leave a lobby
     *
     * @param {Client} client
     * @param {Boolean} isSilent
     * @returns
     * @memberof LobbyManager
     */
    leaveLobby(client, isSilent) {
        try {
            this.checkLogin(client)
            const currentLobbyId = this.getCurrentLobbyId(client, isSilent)
            const currentLobby = this.getLobbyById(currentLobbyId, isSilent)
            this.checkAlreadyInLobbyBeforeLeave(client, currentLobby)
            if (client === currentLobby.host) {
                // 房主退出房间，所有人断开
                this.leaveLobbyHost(currentLobby)
                return
            }
            this.leaveLobbyGuest(client, currentLobby)
        } catch (err) {
            this.leaveLobbyWithoutId(client)
            return null
        }
    }

    /**
     * Leave all lobbies of a client without the lobby id
     *
     * @param {Client} client
     * @memberof LobbyManager
     */
    leaveLobbyWithoutId(client, isSilent = false) {
        Object.keys(this.lobbies)
            .filter(id => {
                return this.lobbies[id].getClients().includes(client)
            })
            .forEach(id => {
                const currentLobby = this.lobbies[id]
                if (currentLobby.host === client) {
                    this.dismissLobby(currentLobby, isSilent)
                } else {
                    this.leaveLobbyGuest(client, currentLobby, isSilent)
                }
            })
    }

    /**
     * Dismiss a lobby, same as leaveLobbyHost
     *
     * @param {Lobby} lobby
     * @param {Boolean} isSilent
     * @returns
     * @memberof LobbyManager
     */
    dismissLobby(lobby, isSilent) {
        return this.leaveLobbyHost(lobby, isSilent)
    }

    /**
     * Leave the lobby when current client is host
     *
     * @param {Lobby} lobby
     * @param {Boolean} isSilent
     * @returns
     * @memberof LobbyManager
     */
    leaveLobbyHost(lobby, isSilent) {
        if (!lobby) {
            return
        }
        lobby.getClients().forEach(client => {
            client.set('currentLobbyId', undefined)
        })
        if (!isSilent) {
            lobbyManager.getClients().forEach(client => {
                client.send(CMD.LOBBY_LEAVE_SUCCESS, {
                    id: lobby.id,
                    isHost: true,
                })
            })
        }
        delete this.lobbies[lobby.id]
    }

    /**
     * Leave the lobby when current client is guest
     *
     * @param {Client} client
     * @param {Lobby} lobby
     * @param {Boolean} isSilent
     * @returns
     * @memberof LobbyManager
     */
    leaveLobbyGuest(client, lobby, isSilent) {
        if (!lobby) {
            return
        }
        client.set('currentLobbyId', undefined)
        if (!isSilent) {
            lobbyManager.getClients().forEach(otherClient => {
                otherClient.send(CMD.LOBBY_LEAVE_SUCCESS, {
                    id: lobby.id,
                    name: client.clientName,
                })
            })
        }
        lobby.guests = lobby.guests.filter(guest => guest !== client)
    }
}

const lobbyManager = new LobbyManager()

lobbyManager.on('clientDropped', client => {
    if (client.get('currentLobbyId') > 0) {
        lobbyManager.leaveLobbyWithoutId(client)
    }
})

module.exports = lobbyManager
