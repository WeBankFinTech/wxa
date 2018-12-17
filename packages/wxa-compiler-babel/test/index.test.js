import path from 'path';
import BabelCompiler from '../src/index';
import { default as fs, mock } from 'jest-plugin-fs'

let defaultBabelRc = `{
    "sourceMap": false,
    "presets": ["@babel/preset-env"],
    "plugins": [
        ["@babel/plugin-transform-runtime", {"corejs": false, "version": "7.1.2"}],
        ["@babel/plugin-proposal-decorators", {"decoratorsBeforeExport": true}]
    ],
    "ignore": [
        "@babel"
    ]
}
`

jest.mock('fs', ()=>require('jest-plugin-fs/mock'));

describe('basic feature', ()=>{

    beforeEach(() => {
        fs.root = path.join(__dirname);

        // mkdirp _dirname with _mock.
        fs.mock({
            './_mock': ''
        });
    });
    afterEach(() => fs.restore());

    
    test('default compiler', ()=>{
        let babel = new BabelCompiler(path.join(__dirname, '../'), null);
        
        expect(babel.configs).not.toBeFalsy();
        expect(babel.configs.ignore).toEqual(['node_modules'])
        expect(babel.test.toString()).toBe(/\.js$|\.wxs$/.toString());

        let babel2 = new BabelCompiler(path.join(__dirname, '../'), {ignore: ['@wxa']});
        let babel3 = new BabelCompiler(path.join(__dirname, '../'), {ignore: '@wxa'});
        let babel4 = new BabelCompiler(path.join(__dirname, '../'), {ignore: /@wxa/});

        expect(babel2.configs.ignore).toEqual(['@wxa']);
        expect(babel3.configs.ignore).toEqual(['@wxa']);
        expect(babel4.configs.ignore).toEqual([/@wxa/]);


    });

    test('read .babelrc from current dir', ()=>{
        let babelrc = path.join(__dirname, '.babelrc');
        mock.writeFileSync(babelrc, defaultBabelRc)

        let babel = new BabelCompiler(path.resolve(__dirname), null);

        expect(babel.configs.ignore).toEqual(["@babel"])

        mock.unlinkSync(babelrc);
    });

    // TODO:
    
    // test('read babel.config.js from current dir', ()=>{})

    // test('read package.config from current dri', ()=>{})

    test('transform es string', async ()=>{
        let esString = `let a = 1;`;
        let exp = 'var a = 1;';

        let babel = new BabelCompiler(path.join(__dirname, '../'), {
            presets: [require('@babel/preset-env')]
        });
        
        let {code} = await babel.parse({meta: {source: path.join(__dirname, 'test.js')}, content: esString}, {cache: false});
        
        expect(code).toMatch(exp);
        
        mock.writeFileSync(path.join(__dirname, 'file.test.js'), esString);
        let fileRet = await babel.parse({meta: {source: path.join(__dirname, 'file.test.js')}}, {cache: false});

        expect(fileRet.code).toMatch(exp);
    })

    test('return origin code', async ()=>{
        let esString = `let a = 1;`;
        let babel = new BabelCompiler(path.join(__dirname, '../'), JSON.parse(defaultBabelRc))

        let mdl = {meta: {source: path.join(__dirname, '@babel', 'test.js')}, content: esString};

        let ret = await babel.parse(mdl, {cache: false});

        expect(ret.code).toBe(esString);

        let emptyCodeRet = await babel.parse((mdl.content='', mdl), {cache: false});

        expect(emptyCodeRet.code).toBe('');
    })

    test('parse error', async ()=>{
        let esString = `let a = `;
        let babel = new BabelCompiler(path.join(__dirname, '../'), {
            presets: [require('@babel/preset-env')]
        })

        let mdl = {meta: {source: path.join(__dirname, 'test.js')}, content: esString};
        
        expect(babel.parse(mdl, {cache: false})).rejects.toThrowError();

        expect(babel.parse((mdl.meta.source=void(0), mdl), {cache: false})).rejects.toThrowError();
        
    })

    test('throw error while ignore not string or array', ()=>{
        expect(()=>{
            new BabelCompiler(__dirname, {
                ignore: {}
            })
        }).toThrowError();
    })
})