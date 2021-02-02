import diff from './diff/diff';
import {compareVersion} from './utils/helpers';

let toString = Object.prototype.toString;

function _isObj(e) {
    return '[object Object]' === toString.call(e);
}

/**
 * 解析出属性最终对应的子对象的属性名，以及对应的子对象
 * @param {object} data 对象
 * @param {array} keysArr 属性键数组
 * @return {object} 对应子属性值和子属性名
 */
function parseData(data, keysArr) {
    // e => data  t => keysArr
    // e: page.data的深拷贝副本, t为包含子对象属性名的属性数组
    /*
        - 遍历属性数组[a,b], e={a: {b: 1}}
        1. i=0, 此时o为Object类型时, n = a, r = {a: {b: 1}}, o = {b: 1};
        2. i=1, 此时o为Object类型时, n = b, r = {b: 1}, o = 1;
        retrun { obj: {b: 1}, key: b}

        - 遍历属性数组[a,0,b], e={a: [{b: 1}]}
        1. i=0, 此时keysArr[i]=a, o为Object类型时, n = a, r = {a: [{b: 1}]}, o = [{b: 1}];
        2. i=1, 此时keysArr[i]=0, o为Array类型时, n = 0, r = [{b: 1}], o = {b: 1};
        3. i=2, 此时keysArr[i]=b, o为Object类型时, n = b, r = {b: 1}, o = 1;
        retrun { obj: {b: 1}, key: b}
    */
    let r = {};
    let key;
    for (let o = data, i = 0; i < keysArr.length; i++) {
        Number(keysArr[i]) === keysArr[i] && keysArr[i] % 1 == 0 // keysArr[i]是否为有效的Number
            ? Array.isArray(o) || ((r[key] = []), (o = r[key]))
            : _isObj(o) || ((r[key] = {}), (o = r[key])),
            (key = keysArr[i]),
            (o = (r = o)[keysArr[i]]);
    } // 注意由于逗号分隔符的优先级是最低的，所以这一行会在前面的条件运算符执行完，再执行
    return {
        obj: r,
        key,
    };
}

/**
 * 解析属性名(包含.和[]等数据路径符号)，返回相应的层级数组
 * {abc: 1}中abc属性名 => [abc],
 * {a.b.c: 1}中'a.b.c'属性 => [a,b,c],
 * {"array[0].text": 1} => [array, 0, text]
 * @param {string} key 属性名字符串
 * @return {array} 属性名数组
 */
function parseKey(key) {
    // 如果属性名不是String字符串就抛出异常
    if ('[object String]' !== toString.call(key)) {
        throw new Error('数据路径错误，Path must be a string');
    }
    // justLeft为遇到左括号"["置为true，遇到"]"置为false
    // isCompliantIndex为遇到左括号"["后匹配到"0"~"9"的字符时置为true

    let keysArr = [];
    let tempStr = '';
    for (
        let len = key.length,
            tempIdx = 0,
            isCompliantIndex = !1,
            justLeft = !1,
            index = 0;
        index < len;
        index++
    ) {
        let chat = key[index];

        if ('\\' === chat) {
            // 如果属性名中包含\\. \\[  \\] 三个转义属性字符就将. [ ]三个字符单独拼接到字符串tempStr中保存，否则就拼接\\
            index + 1 < len &&
            ('.' === key[index + 1] ||
                '[' === key[index + 1] ||
                ']' === key[index + 1])
                ? ((tempStr += key[index + 1]), index++)
                : (tempStr += '\\');
        } else if ('.' === chat) {
            // 遇到.字符并且tempStr字符串非空时，就将tempStr保存到keysArr数组中并清空tempStr; 目的是将{ a.b.c.d: 1 }中的链式属性名分开,保存到数组n中，如[a,b,c,]
            tempStr && (keysArr.push(tempStr), (tempStr = ''));
        } else if ('[' === chat) {
            // 遇到[字符并且tempStr字符串非空时，就将tempStr保存到keysArr数组中并清空tempStr；目的是将{ array[11]: 1 }中的数组属性名保存到数组n中，如[array,]
            // 如果此时[为属性名的第一个字符就报错,也就是说属性名不能直接为访问器, 如{ [11]: 1}
            if (
                (tempStr && (keysArr.push(tempStr), (tempStr = '')),
                0 === keysArr.length)
            ) {
                throw new Error(
                    '数据路径错误，Path can not start with []: ' + key
                );
            }
            // justLeft赋值为true, isCompliantIndex赋值为false
            isCompliantIndex = !(justLeft = !0);
        } else if (']' === chat) {
            if (!isCompliantIndex) {
                throw new Error('数据路径错误，Must have number in []: ' + key);
            }
            // 遍历到{ array[11]: 1 }中的']'的时候，就将a赋值为false, 并将tempIdx保存到数组keysArr中，如[array,11,]
            (justLeft = !1), keysArr.push(tempIdx), (tempIdx = 0);
        } else if (justLeft) {
            if (chat < '0' || '9' < chat) {
                throw new Error(
                    '数据路径错误，Only number 0-9 could inside []: ' + key
                );
            }
            // 遍历到{ array[11]: 1 }中的'11'的时候，就将i赋值为true, 并将string类型的数字计算成Number类型保存到tempIdx中
            (isCompliantIndex = !0),
                (tempIdx = 10 * tempIdx + chat.charCodeAt(0) - 48);
        } else {
            tempStr += chat;
        } // 普通类型的字符就直接拼接到tempStr中
    }
    // 将普通的字符串属性名，.和]后面剩余的字符串保存到数组keysArr中,如{abc: 1} => [abc], {a.b.c: 1} => [a,b,c], {array[0].text: 1} => [array, 0, text]
    if ((tempStr && keysArr.push(tempStr), 0 === keysArr.length)) {
        throw new Error('数据路径错误，Path can not be empty');
    }
    return keysArr;
}

export default (vm, type) => {
    if (!['Page', 'Component'].includes(type)) {
        return;
    }
    let onUnload = vm.onUnload;

    if (type === 'Component') {
        let created = vm.created;
        vm.created = function(...args) {
            this._bupdate_tempData = {};
            this._bupdate_keyPathTempData = {};
            this._bupdate_setDataCbs = [];
            this._bupdate_isUpdating = false;
            created && created.apply(this, args);
        };
    }

    if (type === 'Page') {
        let onLoad = vm.onLoad;
        vm.onLoad = function(...args) {
            this._bupdate_tempData = {};
            this._bupdate_keyPathTempData = {};
            this._bupdate_setDataCbs = [];
            this._bupdate_isUpdating = false;
            onLoad && onLoad.apply(this, args);
        };
    }
 
    vm.onUnload = function(...args) {
        if (this._bupdate_batchedUpdatesTimer) {
            clearTimeout(this._bupdate_batchedUpdatesTimer);
            this._bupdate_batchedUpdatesTimer = null;
        }
        onUnload && onUnload.apply(this, args);
    };
    vm.$setData = function(sourceData, cb) {
        if (sourceData !== null && _isObj(sourceData)) {
            let keysArr = Object.keys(sourceData);
            if (keysArr.length === 0) return;
            // 深拷贝传入的sourceData，避免对原对象产生影响
            let newData = JSON.parse(JSON.stringify(sourceData));
            let keyPathData = {};
            let noKeyPathData = {};
            keysArr.forEach((key) => {
                let keysArr = parseKey(key);
                // console.log('-------keysArr: ', keysArr)
                if (keysArr.length > 1) {
                    // keyPath处理
                    // 第一步：更新this.data的值
                    let parsedData = parseData(this.data, keysArr);
                    let updatingObj = parsedData.obj;
                    let updatingKey = parsedData.key;
                    updatingObj && (updatingObj[updatingKey] = newData[key]);

                    // 第二步：更新this.keyPathTempData的值
                    keyPathData[key] = newData[key];
                } else {
                    // noKeyPath处理
                    noKeyPathData[key] = newData[key];
                }
            });

            // 合并keyPathTempData
            this._bupdate_keyPathTempData = Object.assign(
                this._bupdate_keyPathTempData,
                keyPathData
            );
            
            // diff不包含keyPath属性的对象后再合并tempData
            let diffedData = diff.bind(this)(noKeyPathData);
            // console.log('diff resulet: ', diffedData);
            if (Object.keys(diffedData || {}).length === 0) return;
            this.data = Object.assign(this.data || {}, diffedData);
            this._bupdate_tempData = Object.assign(this._bupdate_tempData, diffedData);

            // 处理回调函数
            if (cb) {
                if (toString.call(cb) === '[object Function]') {
                    this._bupdate_setDataCbs.push(cb);
                } else {
                    throw new Error('第二个参数请传入一个函数！' + cb);
                }
            }
        } else {
            throw new Error('第一个参数请传入一个对象！' + sourceData);
        }
        if (!this._bupdate_isUpdating) {
            if (Object.keys(this._bupdate_tempData).length > 0) {
                this._bupdate_isUpdating = true;
                // 可以考虑下nextTick的兼容性，低版本用setTimeout代替
                let updateFunc = () => {
                    let result = {...this._bupdate_tempData, ...this._bupdate_keyPathTempData};
                    this.setData(result, () => {
                        if (this._bupdate_setDataCbs.length) {
                            this._bupdate_setDataCbs.forEach((cb) => {
                                toString.call(cb) === '[object Function]' &&
                                    cb.apply(this);
                            });
                        }
                        this._bupdate_tempData = {};
                        this._bupdate_keyPathTempData = {};
                        this._bupdate_isUpdating = false;
                        this._bupdate_setDataCbs = [];
                    });
                };
                const {SDKVersion} = wx.getSystemInfoSync();
                if (compareVersion(SDKVersion, '2.2.3') >= 0) {
                    wx.nextTick(updateFunc);
                } else {
                    this._bupdate_batchedUpdatesTimer = setTimeout(updateFunc, 0);
                }
            }
        }
    };
};
