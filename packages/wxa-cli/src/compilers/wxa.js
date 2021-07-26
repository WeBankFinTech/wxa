import path from 'path';
import {readFile, error, isFile, isEmpty} from '../utils';
import Coder from '../helpers/coder';
import logger from '../helpers/logger';
import DependencyResolver from '../helpers/dependencyResolver';
import defaultPret from '../const/defaultPret';
import {parseXML, serializeXML} from './xml';
import JSON5 from 'json5';

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

const encodeXml = (coder, {content, start, endId, isTemplate=false})=>{
    while (content[start++] !== '>') {};

    return isTemplate ?
        coder.encodeTemplate(content, start, content.indexOf(endId)-1)
        :
        coder.encode(content, start, content.indexOf(endId)-1);
};

let markSpecialEmptyAttr = (dom) => {
    dom.forEach((ele)=>{
        if (ele.attribs) {
            Object.keys(ele.attribs).forEach((attrName)=>{
                // suff empty attribs
                if (
                    ele.attribs[attrName] === ''
                ) {
                    ele.attribs[attrName] = '__$$WXASpecialEmptyAttr__';
                }
            });
        }

        if (Array.isArray(ele.children) && ele.children.length) {
            markSpecialEmptyAttr(ele.children);
        }
    });
}
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

        xml = parseXML(content, path.parse(filepath));

        for (let z = 0; z < xml.length; z++) {
            if (xml[z].name === CONFIG_TAG) {
                let t = xml[z];
                xml.splice(z, 1);
                xml.unshift(t);
                break;
            }
        }

        let wxaDefinition = getWxaDefinition();

        const storeNav = {};

        // xml.forEach((node) => {
        for (let node of xml) {
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
                    // trasfer empty attribs to special value;
                    if (nodeName === 'template' && Array.isArray(node.children)) markSpecialEmptyAttr(node.children);

                    Array.prototype.slice.call(node.children||[]).forEach((code)=>{
                        let data = serializeXML(code);
                        if (nodeName !== 'template') {
                            definition.code += coder.decode(data);
                        } else {
                            definition.code += coder.decodeTemplate(data);
                        }
                    });
                }
                // e2e tester set nav info to template module
                if (nodeName === CONFIG_TAG) {
                    const tempContent = JSON5.parse(definition.code);
                    storeNav.navigationBarTitleText = tempContent.navigationBarTitleText || '';
                    storeNav.navigationBarBackgroundColor = tempContent.navigationBarBackgroundColor || '';
                    storeNav.navigationBarTextStyle = tempContent.navigationBarTextStyle || '';
                }
                const {navigationBarTitleText, navigationBarBackgroundColor, navigationBarTextStyle} = storeNav;
                if (nodeName === TEMPLATE_TAG && navigationBarTitleText ) {
                    definition.navigationBarTitleText = navigationBarTitleText;
                }
                if (nodeName === TEMPLATE_TAG && navigationBarBackgroundColor) {
                    definition.navigationBarBackgroundColor = navigationBarBackgroundColor;
                }
                if (nodeName === TEMPLATE_TAG && navigationBarTextStyle) {
                    definition.navigationBarTextStyle = navigationBarTextStyle;
                }

                let opath = path.parse(filepath);
                definition.src = opath.dir + path.sep + opath.name + '.' + definition.type;

                definition.$from = filepath;

                // calc meta object.
                let dr = new DependencyResolver(this.resolve, this.meta);
                let outputPath = dr.getOutputPath(definition.src, {...defaultPret, ext: '.'+definition.type}, wxaDefinition);

                definition.meta = {
                    source: definition.src,
                    outputPath,
                };
            }
        // });
        }

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
