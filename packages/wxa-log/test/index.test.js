import logGenerator from "../src/index";

describe('wxa log plugin', ()=>{
  test('initial plugin in default should return null or undefined', ()=>{
    expect(logGenerator).not.toBeUndefined();
    expect(logGenerator).not.toBeNull();
  });

  test('initial plugin in default should return a specific generator function', ()=>{
    expect(logGenerator).toBeInstanceOf(Function);
  });

  test('initial plugin in default and run will throw error if the passed params is undefined', ()=>{
    function g(){
      logGenerator()();
    }
    expect(g).toThrowError('undefined');
  });

  let target = {};
  logGenerator()(target);
  const {$log} = target;
  test('initial plugin in default and run should add $log attributes to the passed params', ()=>{
    expect($log).toBeInstanceOf(Object);
  });

  test('$log should contain info function', ()=>{
    expect($log.info).toBeInstanceOf(Function);
  });

  test('$log should contain warn function', ()=>{
    expect($log.warn).toBeInstanceOf(Function);
  });

  test('$log should contain error function', ()=>{
    expect($log.error).toBeInstanceOf(Function);
  });

  test('$log should contain setFilterMsg function', ()=>{
    expect($log.setFilterMsg).toBeInstanceOf(Function);
  });

  test('$log should contain addFilterMsg function', ()=>{
    expect($log.addFilterMsg).toBeInstanceOf(Function);
  });

  test('$log.info should throw error when params is not satisfied', ()=>{
    try {
      $log.info('');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });

  test('$log.warn should throw error when params is not satisfied', ()=>{
    try {
      $log.warn('');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });

  test('$log.error should throw error when params is not satisfied', ()=>{
    try {
      $log.error('');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });

  test('$log.info should show warn info if msg contain idno', ()=>{
    try {
      $log.info('我的身份证号码是450602199809087657');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });

  test('$log.info should show warn info if msg contain phone', ()=>{
    try {
      $log.info('我的手机号码是18677678978');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });

  test('$log.info should show warn info if msg contain email', ()=>{
    try {
      $log.info('我的邮箱是lucaszhu@amazing.com');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });

  test('$log.warn should show warn info if msg contain idno', ()=>{
    try {
      $log.warn('我的身份证号码是450602199809087657');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });

  test('$log.warn should show warn info if msg contain phone', ()=>{
    try {
      $log.warn('我的手机号码是18677678978');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });

  test('$log.warn should show warn info if msg contain email', ()=>{
    try {
      $log.warn('我的邮箱是lucaszhu@amazing.com');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });

  test('$log.error should show warn info if msg contain idno', ()=>{
    try {
      $log.error('我的身份证号码是450602199809087657');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });

  test('$log.error should show warn info if msg contain phone', ()=>{
    try {
      $log.error('我的手机号码是18677678978');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });

  test('$log.error should show warn info if msg contain email', ()=>{
    try {
      $log.error('我的邮箱是lucaszhu@amazing.com');
    } catch (e) {
      expect(e).toThrowError('上报日志出现错误');
    }
  });
});
