const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const {parse} = require('@babel/parser');
let code = ``;

code = `
let a = require('/a');

a.x;
a.y;
a.default.u

let n ='n';
a[n];

let b = a;`;

let ast = parse(code, {sourceType: 'unambiguous'});
traverse(ast, {
    enter(path) {
        let scope = path.scope;
        console.log(path.scope);
    },
});

