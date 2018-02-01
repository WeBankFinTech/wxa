export function formatDate(timestap, format) {
    if (!timestap) return '';
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
