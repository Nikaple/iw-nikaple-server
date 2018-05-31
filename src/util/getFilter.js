const SCOPE = {
    DEFAULT: 0,
    OTHERS: 1,
    ALL: 2,
}

const getFilter = client => ({
    [SCOPE.DEFAULT]: currentClient =>
        currentClient.get('currentRoom') === client.get('currentRoom') &&
        currentClient !== client,
    [SCOPE.OTHERS]: currentClient => currentClient => currentClient !== client,
    [SCOPE.ALL]: currentClient => true,
})

module.exports = { SCOPE, getFilter }
