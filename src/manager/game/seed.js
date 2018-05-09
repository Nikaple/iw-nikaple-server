// 请求随机数种子
/**
 *
 *
 * @param {Client} client
 * @param {object} data
 * @param {string} data.cmd
 */
module.exports = (client, data) => {
  const seed = Math.random()
  gameManager.groupBroadcast(client, CMD.GET_SEED, { seed })
}
