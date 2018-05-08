// 请求随机数种子

module.exports = (client, data) => {
  const seed = Math.random()
  gameManager.groupBroadcast(client, COMMAND.GET_SEED, { seed })
}
