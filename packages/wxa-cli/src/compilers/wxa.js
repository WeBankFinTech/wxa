import path from 'path';
import {readFile, error, isFile, isEmpty} from '../utils';
import Coder from '../helpers/coder';
import logger from '../helpers/logger';
import DependencyResolver from '../helpers/dependencyResolver';
import defaultPret from '../const/defaultPret';
import {parseXML, serializeXML} from './xml';

const SCRIPT_TAG = 'script';
const CONFIG_TAG = 'config';
const STYLE_TAG = 'style';
const TEMPLATE_TAG = 'template';

const defaultTypeMap = new Map([
    [SCRIPT_TAG, 'js'],
    [CONFIG_TAG, 'json'],
    [STYLE_TAG, 'css'],
    [TEMPLATE_TAG, 'wxml'],
]);

let getWxaDefinition = ()=>{
    return [SCRIPT_TAG, CONFIG_TAG, TEMPLATE_TAG, STYLE_TAG].reduce((prev, item)=>{
        prev[item] = {
            code: '',
            src: '',
            type: defaultTypeMap.get(item),
        };
        return prev;
    }, {});
};
export default class WxaCompiler {
    constructor(resolve, meta) {
        this.resolve = resolve;
        this.meta = meta;
    }

    parse(filepath, code) {
        let wxa = this.resolveWxa(filepath, code);

        return wxa == null ?
        Promise.reject(null) :
        Promise.resolve({wxa, kind: 'wxa'});
    }

    resolveWxa(filepath, code) {
        let xml;

        let content = code || readFile(filepath);

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

        xml = parseXML(content, path.parse(filepath));

        let wxaDefinition = getWxaDefinition();

        xml.forEach((node) => {
            const nodeName = node.name;
            if (~[SCRIPT_TAG, CONFIG_TAG, STYLE_TAG, TEMPLATE_TAG].indexOf(nodeName)) {
                let definition = wxaDefinition[nodeName];
                definition.src = node.attribs.src;
                definition.type = node.attribs.lang || node.attribs.type || defaultTypeMap.get(nodeName);

                if (definition.src) definition.src = path.resolve(path.dirname(filepath), definition.src);

                if (definition.src && isFile(definition.src)) {
                    const code = readFile(definition.src);
                    if (code == null) throw new Error('打开文件失败:', definition.src);
                    else definition.code += code;
                } else {
                    Array.prototype.slice.call(node.children||[]).forEach((code)=>{
                        let data = serializeXML(code);
                        if (nodeName !== 'template') {
                            definition.code += coder.decode(data);
                        } else {
                            definition.code += coder.decodeTemplate(data);
                        }
                    });
                }

                let opath = path.parse(filepath);
                definition.src = opath.dir + path.sep + opath.name + '.' + definition.type;

                definition.$from = filepath;

                // calc meta object.
                let dr = new DependencyResolver(this.resolve, this.meta);
                let outputPath = dr.getOutputPath(definition.src, defaultPret, wxaDefinition);

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
}
