'use strict';

const LessCompiler = require('../lib/index');

const lessString = `

@import "${__dirname}/global.less";

.math {
    a: 1 + 1;
    b: 2px / 2;
    c: 2px ./ 2;
    d: (2px / 2);
  }
`;

describe('wxa-compiler-less', () => {
    it('Basic usage', async () => {
        const lessCompiler = new LessCompiler(__dirname, {});

        let ret = await lessCompiler.render(lessString, __dirname+'/index.less');

        expect(ret.css).not.toBeFalsy();
        expect(ret.imports[0]).toBe(__dirname+'/global.less');
    });
});
