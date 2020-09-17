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
        this.supportEvents = ['tap', 'longpress', 'change', 'input', 'touchstart', 'touchmove', 'touchend'];
    }

    parse(xml) {
        xml.forEach((element)=>this.walkXML(element));

        this.mdl.code = new Coder().decodeTemplate(domSerializer(xml, {xmlMode: true}));
    }

    walkXML(xml) {
        debug('walk xml start %s', xml.nodeType);
        // ignore comment
        if (xml.type === 'comment') return xml;

        if (xml.type === 'tag') {
            // element p view
            debug('xml %O', xml);
            this.walkAttr(xml.attribs, xml);
        }

        if (xml.children) {
            xml.children.forEach((child)=>{
               this.walkXML(child);
            });
        }

        return xml;
    }

    walkAttr(attributes, element) {
        debug('attributes walk %o', attributes);
        let events = Object.keys(attributes).filter((attr)=>/bind/.test(attr));

        if (events.length) {
            let eventMap = '';
            events.forEach((attr)=>{
                let [, $1] = /bind(?::)?([\w]*)/g.exec(attr);
                if (!!~this.supportEvents.indexOf($1)) {
                    eventMap += `|${$1}:${attributes[attr]}`;
                    element.attribs[`bind${$1}`] = `$$e2e_${$1}`;
                }
            });

            eventMap = eventMap.replace(/^\|/, '');
            element.attribs['data-_wxaTestEventMap'] = eventMap;

            // generate unique id for tag.
            // pagePath + hash(parentNode + prevNode) + optional(class/id)
            let pagePath = path.relative(this.scheduler.wxaConfigs.context, path.dirname(this.mdl.src) + path.sep + path.basename(this.mdl.src, path.extname(this.mdl.src)));

            let ele = this.getParentAndPrevNode(element);
            let eleString = new Coder().decodeTemplate(domSerializer(ele, {xmlMode: true}));
            let hash= getHashWithString(eleString);

            let {isIeration, indexVariable} = this.findSelfOrAncestorIterationDirective(element);

            let keyElement = [pagePath, hash, element.attribs.id];
            if (isIeration) keyElement.push(`-{{${indexVariable}}}`);

            let id = this.assembleUniqueId(keyElement);
            element.attribs['data-_wxaTestUniqueId'] = id;
            element.attribs['class'] = this.dropSpace((element.attribs['class'] || '') + ' '+ id);
        }
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
        let copyChildren = (element)=>{
            element = _.cloneDeep(element);
            let children = [];
            let el = element;
            while (el.prev) {
                children.push(el.prev);
                el = el.prev;
            }
            children = children.reverse();
            children.push(element);
            element.next = null;

            return children;
        };

        let findRoot = (element)=>{
            while (element.parent) {
                element = element.parent;
            }
            return element;
        };

        let _ele = _.cloneDeep(element);

        if (_ele.parent) {
            _ele.parent.children = copyChildren(_ele);

            return findRoot(_ele);
        } else {
            return copyChildren(_ele);
        }
    }

    assembleUniqueId(keyElement) {
        return keyElement.reduce((prev, key)=>{
            if (key) {
                key = key.replace(/[^\w]/g, '');
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
