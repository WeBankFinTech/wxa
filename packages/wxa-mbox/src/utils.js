export function diff(ps, ns) {
    const value = {}
    for (let k in ns) {
        if (k in ps) {
            if (!equals(ps[k], ns[k])) {
                value[k] = ns[k]
            }
        } else {
            value[k] = ns[k]
        }
    }
    return value
}

export function isTypeFunction(fn) {
    return typeof fn === 'function'
}

/**
 * 提取全部可渲染属性到新对象
 * @param {Object} store
 */
export function extract(store) {
    const mapToData = {}
    const displayKeys = Object.getOwnPropertyNames(store).filter(
        key =>
            key !== '$mobx' &&
            key !== '__mobxDidRunLazyInitializers' &&
            typeof store[key] !== 'function'
    )
    displayKeys.forEach(key => {
        mapToData[key] = store[key]
    })
    return mapToData
}

export function isObj(object) {
    return object && typeof (object) === 'object' && Object.prototype.toString.call(object).toLowerCase() === '[object object]'
}

export function isArray(object) {
    return object && typeof (object) === 'object' && object.constructor === Array
}

export function getLength(object) {
    return Object.keys(object).length
}

/**
 * 比较两个对象是否相等
 * @param {*} objA
 * @param {*} objB
 */
export function equals(objA, objB) {
    if (objA === objB) return true
    if (!isObj(objA) || !isObj(objB)) return false // 判断类型是否正确
    if (getLength(objA) !== getLength(objB)) return false // 判断长度是否一致
    return compareObj(objA, objB, true) // 默认为true
}

export function compareObj(objA, objB, flag) {
    for (let key in objA) {
        // 跳出整个循环
        if (!flag) break
        if (!objB.hasOwnProperty(key)) {
            flag = false
            break
        }
        if (!isArray(objA[key])) {
            // 子级不是数组时,比较属性值
            if (objB[key] !== objA[key]) {
                flag = false
                break
            }
        } else {
            if (!isArray(objB[key])) {
                flag = false
                break
            }
            let oA = objA[key]
            let oB = objB[key]
            if (oA.length !== oB.length) {
                flag = false
                break
            }
            for (let k in oA) {
                // 这里跳出循环是为了不让递归继续
                if (!flag) break
                flag = compareObj(oA[k], oB[k], flag)
            }
        }
    }
    return flag
}