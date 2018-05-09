// 请求随机数种子

module.exports = (client, data) => {
  const seed = Math.random()
  gameManager.groupBroadcast(client, CMD.GET_SEED, { seed })
}
