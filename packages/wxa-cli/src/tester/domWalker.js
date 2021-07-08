import XmlCompiler from '../compilers/xml';

import Coder from '../helpers/coder';
import debugPKG from 'debug';
import path from 'path';
import domSerializer from 'dom-serializer';
import {getHashWithString} from '../utils.js';
import _ from 'lodash';

let debug = debugPKG('WXA:E2ETesterDOMWalker');

class XMLManager {
    constructor(mdl, scheduler) {
        this.mdl = mdl;
        this.scheduler = scheduler;
        this.supportEvents = ['tap', 'catchtap', 'longpress', 'change', 'input', 'touchstart', 'touchmove', 'touchend'];
    }

    parse(xml) {
        xml.forEach((element)=>this.walkXML(element));

        this.mdl.code = new Coder().decodeTemplate(domSerializer(xml, {xmlMode: true}));
    }

    walkXML(xml) {
        debug('walk xml start %s', xml.nodeType);
        // ignore comment
        if (xml.type === 'comment') return xml;
    
        if (xml.children) {
            // 故意浅拷贝，仅调整遍历顺序，不改变页面结构
            [...xml.children].reverse().forEach((child)=>{
                this.walkXML(child);
            });
        }
        
        if (xml.type === 'tag') {
            // element p view
            debug('xml %O', xml);
            this.walkAttr(xml.attribs, xml);
        }

        return xml;
    }

    walkAttr(attributes, element) {
        debug('attributes walk %o', attributes);
        if ( !this.scheduler.cmdOptions.record && Object.keys(attributes).includes('catchtap')) { // 非录制，且Catchtap
            delete element.attribs[`catchtap`];
            element.attribs[`bindtap`] = `{{tester.simulationCatchTap}}`;
            return;
        }
        let events = Object.keys(attributes).filter((attr)=>/bind/.test(attr) || attr === 'catchtap');
        let eventMap = '';
        if (events.length) {
            events.forEach((attr)=>{
                if (attr === 'catchtap') { // 增加 Catchtap
                    eventMap += `|catchtap:${attributes[attr]}`;
                    // element.attribs[`data-fun`] = `tester.simulationCatchTap`;
                    element.attribs[`catchtap`] = `$$e2e_catchtap`;
                    return;
                } 
                let [, $1] = /bind(?::)?([\w]*)/g.exec(attr);
                if (!!~this.supportEvents.indexOf($1)) {
                    eventMap += `|${$1}:${attributes[attr]}`;
                    element.attribs[`bind${$1}`] = `$$e2e_${$1}`;
                }
            });
        }
        let openType = Object.keys(attributes).some((attr)=>attr === 'open-type');
        let bindtap = Object.keys(attributes).some((attr)=>attr === 'bindtap');
        if (openType && !bindtap) {
            element.attribs[`bindtap`] = `$$e2e_tap`;
        }
        // navigator标签劫持
        if (element.name === 'navigator') {
            element.attribs['bindtap'] = `$$e2e_tap`;
        }
        if (eventMap) {
            eventMap = eventMap.replace(/^\|/, '');
            element.attribs['data-_wxaTestEventMap'] = eventMap;
        }
        // generate unique id for tag.
        // pagePath + hash(parentNode + prevNode) + optional(class/id)
        let pagePath = path.relative(this.scheduler.wxaConfigs.context, path.dirname(this.mdl.src) + path.sep + path.basename(this.mdl.src, path.extname(this.mdl.src)));

        let ele = this.getParentAndPrevNode(element);
        let eleString = new Coder().decodeTemplate(domSerializer(ele, {xmlMode: true}));
        let hash= getHashWithString(eleString);

        let {isIeration, indexVariable} = this.findSelfOrAncestorIterationDirective(element);

        let keyElement = [pagePath, hash, element.attribs.id];
        if (isIeration) {
            keyElement.push(`_{{${indexVariable}}}`);
        }

        let id = this.assembleUniqueId(keyElement);
        element.attribs['data-_wxaTestUniqueId'] = id;
        element.attribs['class'] = this.dropSpace((element.attribs['class'] || '') + ' '+ id);
    }

    findSelfOrAncestorIterationDirective(element) {
        const IterationDireactive = 'wx:for';
        const IterationIndexDireactive = 'wx:for-index';
        let isIterationDirective = !!element.attribs[IterationDireactive];

        if (!isIterationDirective && element.parent) return this.findSelfOrAncestorIterationDirective(element.parent);

        return {
            isIeration: isIterationDirective,
            indexVariable: element.attribs[IterationIndexDireactive] || 'index',
        };
    }

    getParentAndPrevNode(element) {
        // 1. 找到所有父级和同级位置靠前的节点
        // 2. 清理掉所有后续节点及父级节点的后续节点
        // 3. 清理除了class id 之后所有的属性
        // 4. 清理注释、空白节点
        let copyChildren = (element)=>{
            element = _.cloneDeep(element);
            let children = [];
            let el = element;
            do {
                if (
                    ~['tag'].indexOf(el.type) ||
                    (el.type === 'text' && el.data.replace(/(?<!\\)\\n/g, '').trim() !== '')
                ) {
                    if (el.attribs) {
                        // 清理除了class id 之后所有的属性
                        el.attribs = {
                            class: el.attribs.class,
                            id: el.attribs.id,
                        };
                    }
                    children.push(el);
                }
                el = el.prev;
            } while (el);
            children = children.reverse();
            children.push(element);
            element.next = null;

            return children;
        };

        let travelToRoot = (element)=>{
            while (element.parent) {
                element.parent.children = copyChildren(element);

                element = element.parent;
            }
            return copyChildren(element);
        };

        let cleanChildNodes = (element) => {
            if (Array.isArray(element.children)) {
                element.children = [];
            }

            return element;
        };

        let _ele = _.cloneDeep(element);
        cleanChildNodes(_ele);

        let root = travelToRoot(_ele);
        
        return root;
    }

    assembleUniqueId(keyElement) {
        return keyElement.reduce((prev, key)=>{
            if (key) {
                key = key.replace(/[^\w\{\}\_]/g, '');
                key = key[0].toUpperCase() + key.slice(1);

                return prev + key;
            } else {
                return prev;
            }
        }, '');
    }

    dropSpace(str) {
        return str.replace(/^\s*/, '');
    }
}

export default async function(mdl, scheduler) {
    let code = mdl.code;
    let {xml: dom} = await new XmlCompiler().parse(mdl.src, code);

    new XMLManager(mdl, scheduler).parse(dom);
}
