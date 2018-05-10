const DEBUG_MODE = process.env.GM_SERVER_DEBUG === 'true'

module.exports = (...args) => {
  if (DEBUG_MODE) {
    console.log(...args)
  }
}
