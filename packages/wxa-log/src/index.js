'use strict';
const cloneDeep = require('lodash/cloneDeep');

const log = (wx && wx.getRealtimeLogManager) ? wx.getRealtimeLogManager() : null;
const logger = (wx && wx.getLogManager) ? wx.getLogManager() : null;
const idNoReg = /[\dxX]{10,}/g;
const nameReg = /^(([a-zA-Z+\.?\·?a-zA-Z+]{2,30}$)|([\u4e00-\u9fa5+\·?\u4e00-\u9fa5+]{2,30}$))/g;
const phoneReg = /\d{11}/g;
const emailReg = /[a-z0-9](\w|\.|-)*@([a-z0-9]+-?[a-z0-9]+\.|[a-z0-9]+\.){1,3}[a-z]{2,4}/ig;

/**
 * 处理传入数据
 * 分开写是为了区分每一步做的事情
 * @param {*} data
 * 1、身份证号码、流水号、核心id等
 * 2、姓名
 * 3、手机号码
 * 4、email
 */
const tranDataByRules = (data) => {
  // 处理身份证或者长数字，通常是一些比较敏感的用数字字符串表示的用户信息
  data = data.replace(idNoReg, (d) => {
    return `{${d.slice(0,6)}****}`;
  });
  // 处理中文（姓名）相关的字符串
  data = data.replace(nameReg, (d) => {
    return `{${d.slice(0,1)}***}`;
  });
  // 处理国内手机号码
  data = data.replace(phoneReg, (d) => {
    return `{${d.slice(0,3)}****${d.slice(-4)}}`;
  });
  // 处理邮箱
  data = data.replace(emailReg, (d) => {
    const splitData = d.split('@');
    return `{${splitData[0].slice(0,4)}***@${splitData[1]}}`
  });
  return data;
};

/**
 * 递归处理传入数据可能包含的敏感信息
 * @param {*} obj
 * 1、字符直接处理
 * 2、数组和对象需要把每一项value做处理
 */
const transferSensitiveInfo = (obj) => {
  try {
    if (typeof obj === 'string') {
      // 传入字符串是只能全局处理
      return tranDataByRules(obj);
    } else if (typeof obj === 'object') {
      if (obj instanceof Array) {
        // 如果是数组需要对数组的每一项进行递归
        for (let i = 0, len = obj.length; i < len; i++) {
          const value = obj[i];
          obj[i] = transferSensitiveInfo(value);
        }
      } else {
        // 如果是对象需要对每一项value进行递归
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            obj[key] = transferSensitiveInfo(value);
          }
        }
      }
      return obj;
    }
    return obj;
  } catch (error) {
    const message = `过滤字符串发生错误: ${JSON.stringify(error)}`;
    console.warn(message);
    $log.warn(message);
  }
};

const checkSensitiveInfo = (data) => {
  let isDataContainSensitiveInfo = false;
  if (idNoReg.test(data) || phoneReg.test(data) || emailReg.test(data)) {
    isDataContainSensitiveInfo = true;
  }
  return isDataContainSensitiveInfo;
};

/**
 * 处理传入的参数
 * @param {*} params
 * 约定日志格式：
 * 1、单个参数一句话，如：`ocr识别错误，错误原因${err.msg}以及流水号${err.bizNo}`
 * 2、多参数，如：$log.warn('当前是哪个流程', data)
 * 注意：
 * 因为单个参数一句话形式的日志与其他规则冲突，因此不做过滤处理，请不要在该类日志中包含用户敏感信息，工具只会提示日志存在隐患；
 * 针对第二种日志形式由于第一个文本参数在日志中有标示作用，因此原样输出，后面的ojbect参数按规则进行处理
 */
const processParams = function (params) {
  try {
    // 获取对象keys
    const keys = Object.keys(params);
    if (keys.length > 1) {
      for (let i = 0, len = keys.length; i < len; i++) {
        let info = params[i];
        if (i === 0) {
          if (checkSensitiveInfo(info)) {
            throw new Error('上报日志可能包含敏感信息，请检查');
          }
        } else {
          // 从第二个参数之后开始处理
          info = transferSensitiveInfo(info);
        }
      }
    } else {
      let info = params[0];
      if (typeof info === 'string') {
        // 如果是字符串，检测是否有敏感信息，但不做处理
        if (checkSensitiveInfo(info)) {
          throw new Error('上报日志可能包含敏感信息，请检查');
        }
      } else {
        // 对象的话需要处理
        info = transferSensitiveInfo(info);
      }
    }
  } catch (error) {
    console.info(error);
  } finally {
    return params;
  }
}

/**
 * 每次调用logFn时，根据当前环境集中发起以下三种方法
 * 1、console
 * 2、getRealtimeLogManager
 * 3、getLogManager
 */
const logFn = (e, key) => {
  try {
    if (e.length > 0) {
      if (e.length === 1 && !e[0]) {
        throw new Error('请校验参数参数');
      }else{
        // 处理参数
        const params = processParams(cloneDeep(e));
        if (params) {
          // 调用三种log
          console[key](...e);
          // logger没有error方法，需要fallback
          logger && logger[key === 'error' ? 'warn' : key](params);
          log && log[key](params);
        }
      }
    }else{
      throw new Error('请校验参数参数');
    }
  } catch (error) {
    console.warn('上报日志出现错误: ', error);
  }
};

/**
 * 根据初始化的时候进行复制或者使用默认值
 * TODO: 如果shouldCheckTitle=true，像console.log("日志", {"a": "b"})这种日志上报，会针对第一个参数进行敏感词校验并且在控制台提示用户。从效率的角度考虑，默认不处理第一个参数。
 */

export const $log = {
  info() {
    logFn(arguments, 'info');
  },
  warn() {
    logFn(arguments, 'warn');
  },
  error() {
    logFn(arguments, 'error');
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
  if (vm) {
    vm.$log = $log;
  } else {
    throw new Error('params vm should not be undefined');
  }
};
