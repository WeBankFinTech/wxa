/**
 *
 * @param {Function} fn   实际要执行的函数
 * @param {Number} delay  延迟时间，也就是阈值，单位是毫秒（ms）
 *
 * @return {Function}     返回一个“去弹跳”了的函数
 */
function debounce(fn, delay) {
    // 定时器，用来 setTimeout
    let timer;

    // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
    return function(...args) {
        // 保存函数调用时的上下文和参数，传递给 fn
        let context = this;

        // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
        clearTimeout(timer);

        // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
        // 再过 delay 毫秒就执行 fn
        timer = setTimeout(function() {
            fn.apply(context, args);
        }, delay);
    };
}

export default debounce;
