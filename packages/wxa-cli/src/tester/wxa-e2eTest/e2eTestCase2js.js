const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

const e2eRecord2js = (data) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile(path.join(__dirname + '/e2eTestCaseTpl.ejs'), data, (err, str) => {
            if (err) {
                return reject(err);
            }
            resolve(str);
        });
    });
};

const e2eStartTools = (data) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile(path.join(__dirname + '/e2eTpl.ejs'), data, (err, str) => {
            if (err) {
                return reject(err);
            }
            resolve(str);
        });
    });
};


module.exports = {
    e2eRecord2js,
    e2eStartTools,
};
