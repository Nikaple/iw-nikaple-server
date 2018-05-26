const toCommand = cmd => cmd + (1 << 6)

module.exports = {
    // 客户端请求类型, 0~63
    INIT: 0,
    SYNC: 1,

    // 服务端指令类型，64~127
    UDP_SUCCESS: toCommand(0),
}
