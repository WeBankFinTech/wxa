// import {f} from 'domutils';
import {parseXML, serializeXML} from '../compilers/xml.js';
import {Parser} from 'htmlparser2';
import path from 'path';
import Coder from '../helpers/coder.js';

let whiteDirectiveList = [
    'hidden',
    'wx:else',
];

let whitePropsList = [
    'scale-area',
    'inertia',
    'out-of-bounds',
    'disabled',
    'scale',
    'scroll-x',
    'scroll-y',
    'scroll-with-animation',
    'enable-back-to-top',
    'enable-flex',
    'scroll-anchoring',
    'refresher-enabled',
    'refresher-triggered',
    'indicator-dots',
    'autoplay',
    'circular',
    'vertical',
    'skip-hidden-item-layout',
    'hover-stop-propagation',
    'show-info',
    'active',
    'selectable',
    'decode',
    'plain',
    'loading',
    'show-message-card',
    'checked',
    'read-only',
    'show-img-size',
    'show-img-toolbar',
    'show-img-resize',
    'report-submit',
    'password',
    'auto-focus',
    'focus',
    'confirm-hold',
    'hold-keyboard',
    'show-value',
    'auto-height',
    'fixed',
    'disable-default-padding',
    'loop',
    'controls',
    'webp',
    'lazy-load',
    'show-menu-by-longpress',
    'muted',
    'background-mute',
    'autopush',
    'zoom',
    'mirror',
    'remote-mirror',
    'enable-agc',
    'enable-ans',
    'danmu-btn',
    'enable-danmu',
    'page-gesture',
    'show-mute-btn',
    'enable-play-gesture',
    'vslide-gesture',
    'show-casting-button',
    'picture-in-picture-show-progress',
    'enable-auto-rotation',
    'show-screen-lock-button',
    'show-location',
    'enable-3D',
    'show-compass',
    'show-scale',
    'enable-overlooking',
    'enable-rotate',
    'enable-satellite',
    'enable-traffic',
    'disable-scroll',
];

let whiteList = whitePropsList.concat(whiteDirectiveList);

export function stuffEmptyAttributs(mdl) {
    let coder = new Coder();
    let code = mdl.code;
    code = coder.encodeTemplate(code, 0, code.length);
    let dom = parseXML(
        code,
        path.parse(mdl.src)
    );


    walkDOM(dom);

    mdl.code = coder.decodeTemplate(serializeXML(dom));
}

function walkDOM(dom) {
    dom.forEach((ele)=>{
        if (ele.attribs) {
            Object.keys(ele.attribs).forEach((attrName)=>{
                // suff empty attribs
                if (
                    ele.attribs[attrName] === '' &&
                    ~whiteList.indexOf(attrName)
                ) ele.attribs[attrName] = attrName;
            });
        }

        if (Array.isArray(ele.children) && ele.children.length) {
            walkDOM(ele.children);
        }
    });
}
