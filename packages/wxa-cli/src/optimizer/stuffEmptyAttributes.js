// import {f} from 'domutils';
import {parseXML, serializeXML} from '../compilers/xml.js';
import {Parser} from 'htmlparser2';
import path from 'path';

export function stuffEmptyAttributs(mdl) {
    let dom = parseXML(mdl.code, path.parse(mdl.src));

    walkDOM(dom);

    mdl.code = serializeXML(dom);
}

function walkDOM(dom) {
    dom.forEach((ele)=>{
        if (ele.attribs) {
            Object.keys(ele.attribs).forEach((attrName)=>{
                // suff empty attribs
                if (ele.attribs[attrName] === '') ele.attribs[attrName] = attrName;
            });
        }

        if (Array.isArray(ele.children) && ele.children.length) {
            walkDOM(ele.children);
        }
    });
}
