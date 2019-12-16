var log = (wx && wx.getRealtimeLogManager) ? wx.getRealtimeLogManager() : null;
export const $log = {
  info() {
    console.info(arguments[0]);
    if (!log) return
    log.info.apply(log, arguments)
  },
  warn() {
    console.warn(arguments[0]);
    if (!log) return
    log.warn.apply(log, arguments)
  },
  error() {
    console.error(arguments[0]);
    if (!log) return
    log.error.apply(log, arguments)
  },
  setFilterMsg(msg) { // 从基础库2.7.3开始支持
    if (!log || !log.setFilterMsg) return
    if (typeof msg !== 'string') return
    log.setFilterMsg(msg)
  },
  addFilterMsg(msg) { // 从基础库2.8.1开始支持
    if (!log || !log.addFilterMsg) return
    if (typeof msg !== 'string') return
    log.addFilterMsg(msg)
  }
};

export default () => (vm, type) => {
  vm.$log = $log;
};
