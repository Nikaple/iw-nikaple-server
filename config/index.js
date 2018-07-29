const host = process.env.MONGO_LOCALHOST ? 'localhost' : 'mongo'

module.exports = {
    db: `mongodb://${host}:27017`,
    dbReconnectInterval: 500,
    port: 3738,

    maxLobbyPlayers: 8,
    globalData: {
        version: '2.0.0',
    },
}
