import path from 'path';
import {readFile, error, isFile, isEmpty} from '../utils';
import {DOMParser} from 'xmldom';
import Coder from '../helpers/coder';
import logger from '../helpers/logger';
import DependencyResolver from '../helpers/dependencyResolver';
import defaultPret from '../const/defaultPret';

export default class WxaCompiler {
    constructor(resolve, meta) {
        this.resolve = resolve;
        this.meta = meta;
    }
    parse(filepath) {
        let wxa = this.resolveWxa(filepath);

        return wxa == null ?
        Promise.reject(null) :
        Promise.resolve({wxa, kind: 'wxa'});
    }

    resolveWxa(filepath) {
        let xml;

        let content = readFile(filepath);

        if (content == null) {
            error('打开文件失败:'+filepath);
            return null;
        }

        if (content == '') return null;

        let coder = new Coder();

        let encodeXml = (content, start, endId, isTemplate=false)=>{
            while (content[start++] !== '>') {};

            return isTemplate ?
                coder.encodeTemplate(content, start, content.indexOf(endId)-1)
                :
                coder.encode(content, start, content.indexOf(endId)-1);
        };

        let startScript = content.indexOf('<script') + 7;
        content = encodeXml(content, startScript, '</script>');

        let startConfig = content.indexOf('<config') + 7;
        content = encodeXml(content, startConfig, '</config>');

        if (content.indexOf('<template') > -1) {
            let startTemplate = content.indexOf('<template') + 9;
            content = encodeXml(content, startTemplate, '</template>', true);
        }

        xml = this.parserXml(path.parse(filepath)).parseFromString(content);

        let rst = {
            style: {
                code: '',
                src: '',
                type: 'css',
            },
            template: {
                code: '',
                src: '',
                type: 'wxml',
            },
            script: {
                code: '',
                src: '',
                type: 'js',
            },
            config: {
                code: '',
                src: '',
                type: 'json',
            },
        };

        Array.prototype.slice.call(xml.childNodes || []).forEach((child)=>{
            const nodeName = child.nodeName;
            if (nodeName === 'style' || nodeName === 'template' || nodeName === 'script' || nodeName === 'config') {
                let rstTypeObject;

                rstTypeObject = rst[nodeName];
                rstTypeObject.src = child.getAttribute('src');
                rstTypeObject.type = child.getAttribute('lang') || child.getAttribute('type');

                if (isEmpty(rstTypeObject.type)) {
                    let map = {
                        style: 'css',
                        template: 'wxml',
                        script: 'js',
                        config: 'json',
                    };
                    rstTypeObject.type = map[nodeName];
                }

                if (rstTypeObject.src) rstTypeObject.src = path.resolve(path.parse(filepath).dir, rstTypeObject.src);

                if (rstTypeObject.src && isFile(rstTypeObject.src)) {
                    const code = readFile(rstTypeObject.src);
                    if (code == null) throw new Error('打开文件失败:', rstTypeObject.src);
                    else rstTypeObject.code += code;
                } else {
                    Array.prototype.slice.call(child.childNodes||[]).forEach((code)=>{
                        if (nodeName !== 'template') {
                            rstTypeObject.code += coder.decode(code.toString());
                        } else {
                            rstTypeObject.code += coder.decodeTemplate(code.toString());
                        }
                    });
                }

                if (!rstTypeObject.src) {
                    let opath = path.parse(filepath);


                    rstTypeObject.src = opath.dir + path.sep + opath.name + '.' + rstTypeObject.type;
                }

                rstTypeObject.$from = filepath;

                // calc meta object.
                let dr = new DependencyResolver(this.resolve, this.meta);
                let outputPath = dr.getOutputPath(rstTypeObject.src, defaultPret, rst);

                rstTypeObject.meta = {
                    source: rstTypeObject.src,
                    outputPath,
                };
            }
        });

        rst = Object.keys(rst).reduce((ret, key)=>{
            if (rst[key].src && rst[key].code !== '') {
                ret[key] = rst[key];
            }
            return ret;
        }, {});

        return rst;
    }

    parserXml(opath) {
        return new DOMParser({
            errorHandler: {
                warn(x) {
                    logger.errorNow('XML警告:'+(opath.dir+path.sep+opath.base));
                    logger.warnNow(x);
                },
                error(x) {
                    logger.errorNow('XML错误:'+(opath.dir+path.sep+opath.base));
                    logger.errorNow(x);
                },
            },
        });
    }
}
