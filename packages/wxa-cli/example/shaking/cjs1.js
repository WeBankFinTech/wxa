let fn1 = require('./cjs2').fn1;

fn1();
Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.writeFile = writeFile;
exports.isFile = isFile;
module.exports = {
  getFiles,
};

function getFiles(dir = process.cwd(), prefix = '') {
  let rst = [];
  exports.rst = rst; // exports[aaaa] = aaaa;
  // let ttt= require('sss');
  // console.log(ttt);
  // exports.addClass;
  // module.exports.removeClass;
  // exports[rst];
} // function getConfig() {
//     let configPath = _path.default.join(process.cwd(), 'wxa.config.js');
//     let config = require(configPath);
//     return config;
// }


function writeFile(p, data) {}

function isFile(p) {}
