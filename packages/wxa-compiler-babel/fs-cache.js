/**
 * https://github.com/babel/babel-loader/blob/master/src/fs-cache.js
 * fs-cache promise版本
 */
import crypto from 'crypto';
import mkdirp from 'mkdirp';
import findCacheDir from 'find-cache-dir';
import fs from 'fs';
import os from 'os';
import path from 'path';
import zlib from 'zlib';
import debug from 'debug';

let $logger = debug('fs-cache');

const read = (filename)=>{
    return new Promise((resolve, reject)=>{
        fs.readFile(filename, (err, ret)=>{
            if (err) reject(err);

            zlib.gunzip(ret, (err, content)=>{
                if (err) reject(err);

                let result = {};

                try {
                    result = JSON.parse(content);
                } catch (e) {
                    reject(e);
                }

                return resolve(result);
            });
        });
    });
};

const write = (filename, content)=>{
    return new Promise((resolve, reject)=>{
        let result;
        let tmp = [];
        result = JSON.stringify(content, (key, value)=>{
            if (typeof value === 'object' && value !== null && tmp.indexOf(value) !== -1) return;
            tmp.push(value);
            return value;
        });

        zlib.gzip(result, (err, data)=>{
            if (err) reject(err);

            fs.writeFile(filename, data, (err, data)=>{
                if (err) reject(err);

                resolve();
            });
        });
    });
};

const filename = (source, identifier, options)=>{
    const hash = crypto.createHash('SHA1');
    const content = JSON.stringify({
        source,
        identifier,
        options,
    });

    hash.end(content);

    return hash.read().toString('hex')+'.json.gz';
};

const handleCache = (directory, params)=>{
    return new Promise((resolve, reject)=>{
        const {source, options={}, transform, identifier} = params;
        const shouldFallback = typeof params.directory !== 'string' && directory !== os.tmpdir();

        mkdirp(directory, (err)=>{
            if (err) shouldFallback ? handleCache(os.tmpdir(), params) : reject(err);

            const file = path.join(directory, filename(source, identifier, options));

            read(file).then((succ)=>{
                // cached file
                resolve(succ);
            }, (fail)=>{
                // transform source
                try {
                    params.transform(source, options).then((ret)=>{
                        write(file, ret).then((succ)=>{
                            resolve(ret);
                        }, (fail)=>{
                            if (!shouldFallback) {
                                reject(fail);
                            } else {
                                handleCache(os.tmpdir(), params).then(resolve, reject);
                            }
                        });
                    }, (err)=>reject(err));
                } catch (e) {
                    reject(e);
                }
            });
        });
    });
};

export default function(params) {
    let {directory} = params;
    if (typeof directory !== 'string') {
        directory = findCacheDir({name: '@wxa/compiler-babel'}) || os.tmpdir();
    }
    return handleCache(directory, params);
}
