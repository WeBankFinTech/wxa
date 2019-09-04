const childProcess = require('child_process');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const globby = require('globby');

const build = (src, dist, withSourceMap = false)=> {
    return new Promise((resolve, reject) => {
        let files = globby.sync([src]);

        files.forEach((file) => { 
            if (path.extname(file) !== '.js') {
                let relativePath = path.relative(src, file);
                let outputPath = path.join(dist, relativePath);
                // console.log(file, relativePath, outputPath);
                mkdirp.sync(path.dirname(outputPath));
                fs.writeFileSync(outputPath, fs.readFileSync(file));
            }
        });

        childProcess.exec(`npx babel ${src} --out-dir ${dist} ${withSourceMap ? '--source-maps' : ''}`, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                return reject(error);
            }

            console.log(stdout);
            console.error(stderr);

            resolve(stdout);
        });
    });
};

module.exports = build;
