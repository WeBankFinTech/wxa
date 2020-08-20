var debug = require('debug')('WXA:PLUGIN-REPLACE')
var htmlparser2 = require('htmlparser2');

let { Parser, DomHandler, DomUtils } = htmlparser2;
module.exports = class BindCapture {
    constructor(options = {}) {
        this.configs = Object.assign({}, {
            test: /\.wxml$/,
            plugins: []
        }, { options });
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
        if (mdl.content) {
            let tapFnName = this.configs.options.tap || 'wxaTapCapture';
            let handler = new DomHandler((err, dom) => {
                if (err) {
                    logger.error('XML错误:'+(opath.dir+path.sep+opath.base));
                    logger.error(err);
                }
            }, {
                normalizeWhitespace: true,   //default:false
            });

            let htmlStr = mdl.content;
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
            mdl.content = DomUtils.getOuterHTML(dom);
        }
    }
}