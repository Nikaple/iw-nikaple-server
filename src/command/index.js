module.exports = {
  // 已连接
  CONNECTED: 'connected',
  // 断开连接
  DISCONNECTED: 'disconnected',

  // 注册成功
  REGISTER_SUCCESS: 'register_success',
  // 注册失败
  REGISTER_FAILED: 'register_failed',

  // 需要登录
  LOGIN_NEEDED: 'login_needed',
  // 登录成功
  LOGIN_SUCCESS: 'login_success',
  // 登录失败
  LOGIN_FAILED: 'login_failed',
  // 登出
  LOGOUT: 'logout',

  // 成功创建房间
  LOBBY_CREATE_SUCCESS: 'lobby_create_success',
  // 成功加入房间
  LOBBY_JOIN_SUCCESS: 'lobby_join_success',
  // 成功离开房间
  LOBBY_LEAVE_SUCCESS: 'lobby_leave_success',
  // 房间不存在
  LOBBY_NOT_EXISTS: 'lobby_not_exists',
  // 未加入房间时选择退出房间
  LOBBY_NOT_FOUND: 'lobby_not_found',
  // 房间密码错误
  LOBBY_PASS_NOT_VALID: 'lobby_pass_not_valid',
  // 不能加入自己创建的房间
  LOBBY_SAME_ID: 'lobby_same_id',
  // 非房主不能开始游戏
  LOBBY_NOT_AUTHORIZED: 'lobby_not_authorized',

  // 开始游戏
  GAME_START: 'game_start',
  // 同步
  GAME_SYNC: 'game_sync',
}
