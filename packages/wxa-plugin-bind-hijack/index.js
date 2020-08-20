var debug = require('debug')('WXA:PLUGIN-REPLACE')
var htmlparser2 = require('htmlparser2');

let { Parser, DomHandler, DomUtils } = htmlparser2;
const defaultOptions = {
    tap: 'wxaTapCapture',
}

module.exports = class BindCapture {
    constructor(options = {}) {
        this.configs = Object.assign({}, {
            test: /\.wxml$/,
            plugins: []
        }, { options: defaultOptions });
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
                debug('Plugin replace started %O', mdl.src);
                this.run(mdl);
            }
        })
    }
    run(mdl) {
        if (mdl.content && mdl.content.replace) {
            let tapFnName = this.configs.options.tap;

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
                        if (v.attribs['data-tap']) {
                            logger.error('data-tap属性已存在:' + mdl.meta.source);
                        }
                        let bindtapAttr = v.attribs.bindtap || v.attribs['bind:tap'];
                        if (bindtapAttr) {
                            v.attribs.bindtap = tapFnName;
                            v.attribs['data-tap'] = bindtapAttr;
                        }
                        let catchtapAttr = v.attribs.catchtap || v.attribs['catch:tap'];
                        if (catchtapAttr) {
                            v.attribs.catchtap = tapFnName;
                            v.attribs['data-tap'] = catchtapAttr;
                        }
                        // if(v.attribs.bindgetuserinfo){
                        //     v.attribs.bindgetuserinfo = tapFnName;
                        //     v.attribs['data-tap'] = v.attribs.bindgetuserinfo;
                        // }
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