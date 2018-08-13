export default function(code, category, path) {
    let temp = `
        var wrapWxa = require('$wxa://wxa_wrap').default;
        wrapWxa(exports, ${category}, ${path});

        ${code}
    `;

    return temp;
}
