import path from 'path';
import {readFile, error, encode, warn, isFile, decode, applyPlugins} from './utils';
import {DOMParser} from 'xmldom';
import CStyle from './compile-style';
import CTemplate from './compile-template';
import CScript from './compile-script';
import CConfig from './compile-config';

class CompileWxa {
    constructor(src, dist, ext) {
        this.current = process.cwd();
        this.src = src;
        this.dist = dist;
        this.ext = ext;
    }
    compile(opath) {
        this.$compile(opath);
    }
    $compile(opath) {
        let wxa = this.resolveWxa(opath);
        // console.log(wxa);
        if (!wxa) return;

        let filepath = path.join(opath.dir, opath.base);
        let type = 'other';
        if (filepath === path.join(this.current, this.src, 'app' + this.ext)) type = 'app';

        if (type === 'app') delete wxa.template;

        if (wxa.style) {
            let cStyle = new CStyle(this.src, this.dist, this.ext);
            cStyle.compile(wxa.style, opath);
        }

        if (wxa.template && wxa.template.code) {
            let cTemplate = new CTemplate(this.src, this.dist, this.ext);
            cTemplate.compile(wxa.template);
        }

        if (wxa.script.code) {
            let compiler = new CScript(this.src, this.dist, this.ext);
            applyPlugins(compiler);
            compiler.compile(wxa.script.type, wxa.script.code, type, opath);
        }

        if (wxa.config.code) {
            let compiler = new CConfig(this.src, this.dist);
            applyPlugins(compiler);
            compiler.compile(wxa.config.code, opath);
        }
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

        let encodeXml = (content, start, endId)=>{
            while (content[start++] !== '>') {};

            return encode(content, start, content.indexOf(endId)-1);
        };

        let startScript = content.indexOf('<script') + 7;
        let startConfig = content.indexOf('<config') + 7;
        content = encodeXml(content, startScript, '</script>');
        content = encodeXml(content, startConfig, '</config>');
        // if (startlen >=7 && content.length >= 8) {
        //     while (content[startlen++] !== '>') {}

        //     content = encode(content, startlen, content.indexOf('</script>') -1);
        // }

        xml = this.parserXml().parseFromString(content);

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
                rstTypeObject.type = child.getAttribute('lang') || child.getAttribute('type') || 'js';

                if (rstTypeObject.src) rstTypeObject.src = path.resolve(opath.dir, rstTypeObject.src);

                if (rstTypeObject.src && isFile(rstTypeObject.src)) {
                    const code = readFile(rstTypeObject.src);
                    if (code == null) throw new Error('打开文件失败:', rstTypeObject.src);
                    else rstTypeObject.code += code;
                } else {
                    Array.prototype.slice.call(child.childNodes||[]).forEach((code)=>{
                        // console.log(code);
                        rstTypeObject.code += decode(code.toString());
                    });
                }

                if (!rstTypeObject.src) rstTypeObject.src = path.join(opath.dir, opath.base);
            }
        });

        return rst;
    }
    parserXml() {
        return new DOMParser({
            errorHanlder: {
                warn(x) {
                    warn(x);
                },
                error(x) {
                    error(x);
                },
            },
        });
    }
}

export default CompileWxa;
