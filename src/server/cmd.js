const toCommand = cmd => cmd + (1 << 7)

module.exports = {
    // 客户端请求类型, 0~63
    INIT: 0,
    SYNC: 1,

    // 服务端指令类型，128~255
    UDP_SUCCESS: toCommand(0),
}
