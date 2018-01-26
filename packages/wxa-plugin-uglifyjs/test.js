const uglify = require('uglify-js');
let code = '{"navigationBarTitle": "hehe"}'
let rst = uglify.minify(code, {});
console.log(rst);
console.log(Object.keys(rst))