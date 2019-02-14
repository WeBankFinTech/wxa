export function formatDate(timestamp: number | string, format: string): string {
    if (
        !timestamp ||
        timestamp == Number.POSITIVE_INFINITY ||
        timestamp == Number.NEGATIVE_INFINITY
    ) return '';

    format = format || 'yyyy-MM-dd hh:mm:ss';
    let date: Date = new Date(timestamp + '');
    let obj: Record<string, number> = {
        'y+': date.getFullYear(),
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
    };

    if (new RegExp('(y+)').test(format)) {
        format = format.replace(RegExp.$1, obj['y+'].toString());
    }
    for (let j in obj) {
        if (new RegExp('(' + j + ')').test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (obj[j]).toString() : (('00' + obj[j]).substr(('' + obj[j]).length)));
        }
    }
    return format;
}

export function trim(str: string): string {
    if (typeof str === 'string') {
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
    return str;
}

export function compareVersion(v1: string, v2: string): 1 | 0 | -1 {
    if (v1 == null) return -1;
    if (v2 == null) return 1;

    let s1: string[] = v1.toString().split('.');
    let s2: string[] = v2.toString().split('.');
    let len: number = Math.max(s1.length, v2.length);

    while (s1.length < len) {
        s1.push('0');
    }
    while (s2.length < len) {
        s2.push('0');
    }

    for (let i = 0; i < len; i++) {
        let num1: number = parseInt(s1[i]);
        let num2: number = parseInt(s2[i]);

        if (num1 > num2) {
            return 1;
        } else if (num1 < num2) {
            return -1;
        }
    }

    return 0;
}
