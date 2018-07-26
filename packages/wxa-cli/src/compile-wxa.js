import path from 'path';
import {readFile, error, warn, isFile, isEmpty} from './utils';
import {DOMParser} from 'xmldom';
import Coder from './helpers/coder';
import schedule from './schedule';
import logger from './helpers/logger';

class CompileWxa {
    constructor(src, dist, ext, options) {
        this.current = process.cwd();
        this.src = src;
        this.dist = dist;
        this.ext = ext;
        this.options = options;
    }
    compile(opath, configs) {
        return this.$compile(opath, configs);
    }
    $compile(opath, configs) {
        let wxa = this.resolveWxa(opath);
        // console.log(wxa);
        if (!wxa) return Promise.reject();

        let filepath = path.join(opath.dir, opath.base);
        if (filepath === path.join(this.current, this.src, 'app' + this.ext)) {
            // let appConfig = JSON.parse('"'+wxa.config+'"');
            console.log(JSON.parse(wxa.config.code));
            delete wxa.template;
        }

        schedule.addTask(opath, wxa, configs);

        return Promise.resolve();
    }

    resolveWxa(xml, opath) {
        let filepath;

        if (typeof xml === 'object' && xml.dir) {
            opath = xml;
            filepath = path.join(opath.dir, opath.base);
        } else {
            opath = path.parse(xml);
            filepath = xml;
        }

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

        xml = this.parserXml(opath).parseFromString(content);

        let rst = {
            style: [],
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
                type: 'config',
            },
        };

        // console.log(xml);

        Array.prototype.slice.call(xml.childNodes || []).forEach((child)=>{
            const nodeName = child.nodeName;
            if (nodeName === 'style' || nodeName === 'template' || nodeName === 'script' || nodeName === 'config') {
                let rstTypeObject;

                if (nodeName === 'style') {
                    rstTypeObject = {code: ''};
                    rst[nodeName].push(rstTypeObject);
                } else {
                    rstTypeObject = rst[nodeName];
                }
                rstTypeObject.src = child.getAttribute('src');
                rstTypeObject.type = child.getAttribute('lang') || child.getAttribute('type');

                if (isEmpty(rstTypeObject.type)) {
                    let map = {
                        style: 'scss',
                        template: 'wxml',
                        script: 'js',
                        config: 'json',
                    };
                    rstTypeObject.type = map[nodeName];
                }

                if (rstTypeObject.src) rstTypeObject.src = path.resolve(opath.dir, rstTypeObject.src);

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

                if (!rstTypeObject.src) rstTypeObject.src = path.join(opath.dir, opath.base);
            }
        });

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

export default CompileWxa;
