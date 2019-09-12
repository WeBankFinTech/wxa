export default function(code, category='', path) {
    let temp = `
var wrapWxa = require('wxa://wxa_wrap').default;
wrapWxa(exports, "${category.toUpperCase()}", "${path}");

${code}`;

    return temp;
}
