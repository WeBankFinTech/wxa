import path from 'path';
import {readFile, isFile, isEmpty} from '../utils';
import {DOMParser} from 'xmldom';
import Coder from '../helpers/coder';
import logger from '../helpers/logger';
import DependencyResolver from '../helpers/dependencyResolver';
import defaultPret from '../const/defaultPret';

const encodeXml = (coder, {content, start, endId, isTemplate=false})=>{
    while (content[start++] !== '>') {};

    return isTemplate ?
        coder.encodeTemplate(content, start, content.indexOf(endId)-1)
        :
        coder.encode(content, start, content.indexOf(endId)-1);
};

export default class WxaCompiler {
    constructor(resolve, meta, mdl) {
        this.resolve = resolve;
        this.meta = meta;
        this.mdl = mdl;
        this.pret = this.mdl.pret || defaultPret;
    }

    parse(filepath, code) {
        let wxa = this.resolveWxa(filepath, code);

        return wxa == null ? Promise.reject(null) : Promise.resolve({wxa, kind: 'wxa'});
    }

    resolveWxa(filepath, code) {
        let xml;

        let content = code || readFile(filepath);

        if (isEmpty(content)) return null;

        let coder = new Coder();

        let startScript = content.indexOf('<script') + 7;
        content = encodeXml(coder, {content, start: startScript, endId: '</script>'});

        let startConfig = content.indexOf('<config') + 7;
        content = encodeXml(coder, {content, start: startConfig, endId: '</config>'});

        if (content.indexOf('<template') > -1) {
            let startTemplate = content.indexOf('<template') + 9;
            content = encodeXml(coder, {content, start: startTemplate, endId: '</template>', isTemplate: true});
        }

        xml = this.parserXml(filepath).parseFromString(content);

        let wxaDefinition = {
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
            if (
                ~['style', 'template', 'script', 'config'].indexOf(nodeName)
            ) {
                let definition = wxaDefinition[nodeName];
                definition.src = child.getAttribute('src');
                definition.type = (
                    child.getAttribute('lang') ||
                    child.getAttribute('type') ||
                    definition.type
                );
                // use url=xxx to import source code.
                if (definition.src) definition.src = path.resolve(path.dirname(filepath), definition.src);

                if (definition.src && isFile(definition.src)) {
                    const code = readFile(definition.src);
                    if (code == null) throw new Error('打开文件失败:', definition.src);
                    else definition.code += code;
                } else {
                    Array.prototype.slice.call(child.childNodes||[]).forEach((code)=>{
                        if (nodeName !== 'template') {
                            definition.code += coder.decode(code.toString());
                        } else {
                            definition.code += coder.decodeTemplate(code.toString());
                        }
                    });
                }

                definition.src = path.dirname(filepath) + path.sep + path.basename(filepath, path.extname(filepath)) + '.' + definition.type;

                definition.$from = filepath;

                // calc meta object.
                let dr = new DependencyResolver(this.resolve, this.meta);
                // mock for wxa file.
                let outputPath = dr.getOutputPath(definition.src, {...this.pret, ext: '.'+definition.type}, wxaDefinition);

                definition.meta = {
                    source: definition.src,
                    outputPath,
                };
            }
        });

        wxaDefinition = Object.keys(wxaDefinition).reduce((ret, key)=>{
            // in wxa tempate and script is alway generated cause they are required.
            // but config and style is optional
            // https://developers.weixin.qq.com/miniprogram/dev/framework/structure.html
            if (
                (wxaDefinition[key].src && wxaDefinition[key].code !== '') ||
                ~['script', 'template'].indexOf(key)
            ) {
                ret[key] = wxaDefinition[key];
            }
            return ret;
        }, {});

        return wxaDefinition;
    }

    parserXml(filepath) {
        return new DOMParser({
            errorHandler: {
                warn(x) {
                    logger.error('XML警告:' + filepath);
                    logger.warn(x);
                },
                error(x) {
                    logger.error('XML错误:' + filepath);
                    logger.error(x);
                },
            },
        });
    }
}
