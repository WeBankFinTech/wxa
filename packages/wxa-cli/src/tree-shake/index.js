let config = require('./config');
let {Graph} = require('./graph');
let {TreeShake} = require('./tree-shake');
let mergeWith = require('lodash/mergeWith');
let isArray = require('lodash/isArray');

function setConfig(options) {
    if (
        !options.entry ||
        !Array.isArray(options.entry) ||
        !options.entry.length
    ) {
        throw new Error('Options entry is required');
    }

    mergeWith(config, options, (objValue, srcValue) => {
        if (isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    });
}

function treeShake(options = {}) {
    setConfig(options);

    let graph = new Graph();
    let treeShake = new TreeShake(graph.roots);
    let files = treeShake.run();
    return files;
}

module.exports = {
    treeShake,
};

// console.time('end');
// let path = require('path');
// const {writeFile} = require('./util');
// let entrySrc = path.resolve(__dirname, '../../example/index.js');
// let files = treeShake({
//     entry: [{src: entrySrc}],
//     commonJS: {enable: true},
// });

// Object.values(files).forEach(({src, formattedCode}) => {
//     writeFile(
//         path.resolve(path.dirname(src), './shaking', path.basename(src)),
//         formattedCode
//     );
// });
// console.timeEnd('end');
