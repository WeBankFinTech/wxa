var debug = require('debug')('WXA:PLUGIN-REPLACE')
var htmlparser2 = require('htmlparser2');

let { Parser, DomHandler, DomUtils } = htmlparser2;
const defaultOptions = ['tap'];

module.exports = class BindCapture {
    constructor(options = defaultOptions) {
        this.configs = Object.assign({}, {
            test: /\.wxml$/,
            plugins: []
        }, { options });
        this.pmap=['<', '&', '"', '>'];
        this.amap=['&lt;', '&amp;', '&quot;', '&gt;'];
    }
    apply(compiler) {
        if (compiler.hooks == null || compiler.hooks.buildModule == null) return;

        compiler.hooks.buildModule.tap('BindCapture', (mdl) => {
            if (
                mdl.meta &&
                this.configs.test.test(mdl.meta.source)
            ) {
                debug('Plugin bind hijack started %O', mdl.src);
                this.run(mdl);
            }
        })
    }
    run(mdl) {
        if (mdl.content && mdl.content.replace) {
            let configsOptions = this.configs.options;

            let handler = new DomHandler((err, dom) => {
                if (err) {
                    logger.error('XML错误:'+mdl.meta.source);
                    logger.error(err);
                }
            }, {
                normalizeWhitespace: true,   //default:false
            });

            let htmlStr = mdl.content.replace(/{{([^{}]*)}}/g, (match, express) => `{{${this.encode(express)}}}`);
            new Parser(handler, {
                xmlMode: false, // forgiving html parser
                recognizeSelfClosing: true,
                lowerCaseTags: false, // needn't make tag lower case
                lowerCaseAttributeNames: false,
                recognizeCDATA: true,
            }).end(htmlStr);

            let dom = handler.dom;
            let rewrite = function (dom) {
                dom.forEach(v => {
                    if(v.attribs){
                        let hasEvent = false;
                        if(!configsOptions || configsOptions.length === 0){ //拦截所有事件
                            Object.keys(v.attribs).forEach(attr => {
                                if(attr.indexOf('bind') === 0 || attr.indexOf('catch') === 0){
                                    v.attribs[`data-${attr.replace(/^bind:|catch:|bind|catch/, '')}`] = v.attribs[attr];
                                    v.attribs[attr] = 'wxaHijack';
                                    hasEvent = true;
                                }
                            });
                        } else {
                            configsOptions.forEach(event => {
                                if (v.attribs[`data-${event}`]) {
                                    logger.error(`data-${event} 属性已存在: ${mdl.meta.source}`);
                                }
                                let hijackFnName = `wxaHijack${event[0].toUpperCase()}${event.substr(1)}`;
                                let bindAttr = v.attribs[`bind${event}`] || v.attribs[`bind:${event}`];
                                if (bindAttr) {
                                    v.attribs[`bind${event}`] = hijackFnName;
                                    v.attribs[`data-${event}`] = bindAttr;
                                    hasEvent = true;
                                }
                                let catchAttr = v.attribs[`catch${event}`] || v.attribs[`catch:${event}`];
                                if (catchAttr) {
                                    v.attribs[`catch${event}`] = hijackFnName;
                                    v.attribs[`data-${event}`] = catchAttr;
                                    hasEvent = true;
                                }
                            })
                        }
                        if(hasEvent){ // 为事件参数增加一些标记
                            console.log(v);
                            let elementId = v.type;
                            if(v.name) elementId = elementId + `.${v.name}`;
                            if(v.attribs.id) elementId = elementId + `#${v.attribs.id}`;
                            if(v.attribs.class) elementId = elementId + `.${v.attribs.class}`;
                            if(v.data) elementId = elementId + `-${v.data}`;
                            v.attribs[`data-wxa-id`] = elementId;
                        }
                    }
                    if (v.children) {
                        rewrite(v.children);
                    }
                });
            }
            rewrite(dom);

            mdl.content = DomUtils.getOuterHTML(dom)
                    .replace(/{{([^{}]*)}}/g, (match, express) => `{{${this.decode(express)}}}`);
        }
    }
    decode(content, pmap, amap) {
        pmap = pmap || this.pmap;
        amap = amap || this.amap;

        let ret = amap.reduce((ret, item)=>(ret+'|'+item), '').replace(/^\|/, '');
        let reg = new RegExp(`(${ret})`, 'ig');
        return content.replace(reg, (match, m) => {
            return pmap[amap.indexOf(m)];
        });
    }
    encode(content, start, end, pmap, amap) {
        start = start || 0;
        end = end || content.length;
        pmap = pmap || this.pmap;
        amap = amap || this.amap;
        let buffer = [];

        for (let i=0, len=content.length; i < len; i++) {
            if (i < start || i > end) {
                buffer.push(content[i]);
            } else {
                let idx = pmap.indexOf(content[i]);
                buffer.push(idx === -1 ? content[i] : amap[idx]);
            }
        }

        return buffer.join('');
    }
}