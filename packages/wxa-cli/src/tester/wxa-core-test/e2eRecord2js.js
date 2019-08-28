const fs = require('fs');
const ejs = require('ejs');

let tpl = fs.readFileSync(__dirname + '/e2eRecord2jsTpl.ejs', 'utf8');

const e2eRecord2js = (record) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile(__dirname + '/e2eRecord2jsTpl.ejs', {
            record
        }, (err, str) => {
            if (err) {
                return reject(err);
            }
            resolve(str);
        })
    })

}
// 测试代码
let record = [{"page":"pages/index","event":"tap","id":"Pagesindex73315fe4331859e82832f81a3cd615e9","timeStamp":1566472440497,"detail":{"x":134.85546875,"y":365.14453125}},{"page":"pages/visitor/inviteDetail","event":"change","id":"Pagesvisitor_inviteDetailF43f4435c899b6657003319cf5a48988","timeStamp":1566472454334,"detail":{"value":"2019-08-22"}},{"page":"pages/visitor/inviteDetail","event":"tap","id":"Pagesvisitor_inviteDetail5ba81b4e5ef42c45b6b3ee55f8174fbc","timeStamp":1566472456176,"detail":{"x":259.03515625,"y":159.375}}];

// ejs.renderFile(__dirname + '/e2eRecord2jsTpl.ejs', {
//     record
// }).then((str) => {
//     console.log(str);
// });

e2eRecord2js(record, './automator.js');
module.exports = e2eRecord2js;
