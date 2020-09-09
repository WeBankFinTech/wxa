

import PathParser, {isIgnoreFile} from '../../src/helpers/pathParser';

describe('PathParser: wxa path recognizer', ()=>{
    test('detect target type', () => {
        let parser = new PathParser();

        expect(parser.parse('./foo.js')).toMatchObject({
            isRelative: true
        });
        
        expect(parser.parse('/foo.js')).toMatchObject({
            isAPPAbsolute: true
        });

        expect(parser.parse('plugin://plugin-page/foo')).toMatchObject({
            isWXALib: false,
            isPlugin: true
        });

        expect(parser.parse('#mp-plugin')).toMatchObject({
            isWXALib: false,
            isPlugin: true
        });

        expect(parser.parse('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqgAAAAjCAMAAABvjghcAAAASFBMVEVPl')).toMatchObject({
            isPlugin: false,
            isBase64: true
        });

        expect(parser.parse('@wxa/core')).toMatchObject({
            isNodeModule: true
        });
        expect(parser.parse('lodash/xxx')).toMatchObject({
            isNodeModule: true
        });

        expect(parser.parse('https://google.com')).toMatchObject({
            isURI: true
        });

        expect(parser.parse('wxa://google.com')).toMatchObject({
            isWXALib: true
        });

        expect(parser.parse('https://{{HOST}}/ajdifj')).toMatchObject({
            isDynamic: true,
            isURI: true
        });
    });

    test('exclude file', () => {
        let parser = new PathParser({exclude: '/miniprogram_npm'});

        expect(parser.parse('/miniprogram_npm/weui-miniprogram/dialog/dialog')).toMatchObject({
            isExcludeFile: true
        });

        let parser2 = new PathParser({exclude: ['/miniprogram_npm', /wxa\-ui/]});

        expect(parser2.parse('/miniprogram_npm/weui-miniprogram/dialog/dialog')).toMatchObject({
            isExcludeFile: true
        });

        expect(parser2.parse('/miniprogram_npm/wxa-ui/dialog/dialog')).toMatchObject({
            isExcludeFile: true
        });
    })

    test('thow error while cannot recognize path type', () => {
        let parser = new PathParser({});

        expect(()=>parser.parse('🚀')).toThrowError();

        expect(()=>parser.parse({path: '🚀'})).toThrowError();
    })
});

test('isIgnoreFile', () => {
    expect(isIgnoreFile({
        isExcludeFile: true
    })).toBe(true);
});
