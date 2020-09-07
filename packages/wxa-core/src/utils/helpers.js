export function formatDate(timestap, format) {
    if (
        !timestap ||
        timestap == Number.POSITIVE_INFINITY ||
        timestap == Number.NEGATIVE_INFINITY
    ) return '';

    format = format || 'yyyy-MM-dd hh:mm:ss';
    let date = new Date(Number(timestap));
    let obj = {
        'y+': date.getFullYear(),
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
    };

    if (new RegExp('(y+)').test(format)) {
        format = format.replace(RegExp.$1, obj['y+']);
    }
    for (let j in obj) {
        if (new RegExp('(' + j + ')').test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (obj[j]) : (('00' + obj[j]).substr(('' + obj[j]).length)));
        }
    }
    return format;
}

export function trim(str) {
    if (typeof str === 'string') {
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
    return str;
}

export function compareVersion(v1, v2) {
    if (v1 == null) return -1;
    if (v2 == null) return 1;

    v1 = v1.toString().split('.');
    v2 = v2.toString().split('.');
    let len = Math.max(v1.length, v2.length);

    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }

    for (let i = 0; i < len; i++) {
        let num1 = parseInt(v1[i]);
        let num2 = parseInt(v2[i]);

        if (num1 > num2) {
            return 1;
        } else if (num1 < num2) {
            return -1;
        }
    }

    return 0;
}

export function getPromise() {
    let res;
    let rej;
    let promise = new Promise((resolve, reject)=>{
        res = resolve;
        rej = reject;
    });

    return {resolve: res, reject: rej, promise, defer: promise};
}
