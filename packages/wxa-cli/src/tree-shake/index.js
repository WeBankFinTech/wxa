let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
const {parse} = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

function readFile(p) {
    let rst = '';
    p = typeof p === 'object' ? path.join(p.dir, p.base) : p;
    try {
        rst = fs.readFileSync(p, 'utf-8');
    } catch (e) {
        rst = null;
    }

    return rst;
}

function writeFile(p, data) {
    let opath = typeof p === 'string' ? path.parse(p) : p;
    mkdirp.sync(opath.dir);
    fs.writeFileSync(p, data);
}

let entrySrc = path.resolve(__dirname, '../../example/index.js');
let code = readFile(entrySrc);

let ast = parse(code, {sourceType: 'unambiguous'});

class Scope {
    constructor(options) {
        options = options || {};

        this.parent = options.parent;
        this.depth = this.parent ? this.parent.depth + 1 : 0;
        this.names = options.params || [];
        this.nodes = {};
        this.isBlockScope = !!options.block;
    }
    // 添加变量名
    // isBlockDeclaration 是否是块级声明：let const class import
    add(node, name, isBlockDeclaration) {
        if (!isBlockDeclaration && this.isBlockScope) {
            // it's a `var` or function declaration, and this
            // is a block scope, so we need to go up
            this.parent.add(node, name, isBlockDeclaration);
        } else {
            this.names.push(name);
            this.nodes[name] = node;
        }
    }

    contains(name) {
        return !!this.findDefiningScope(name);
    }

    findDefiningScope(name) {
        if (this.names.includes(name)) {
            return this;
        }

        if (this.parent) {
            return this.parent.findDefiningScope(name);
        }

        return null;
    }
}

let scope = new Scope();

function addToScope(node, attr, isBlockDeclaration = false) {
    let identifierNode = node[attr];

    if (t.isIdentifier(identifierNode)) {
        identifierNode._skip = true;
    }

    node._used = 0;
    scope.add(node, identifierNode.name, isBlockDeclaration);
}

console.time('ast');
traverse(ast, {
    enter(path) {
        let {node} = path;
        let childScope;
        switch (node.type) {
            // 函数声明 function a(){}
            case 'FunctionDeclaration':
                childScope = new Scope({
                    parent: scope,
                    block: false,
                });
                addToScope(node, 'id', false);
            // 箭头函数 ()=>{}
            case 'ArrowFunctionExpression':
            // 函数表达式 function(){}
            case 'FunctionExpression':
                childScope = new Scope({
                    parent: scope,
                    block: false,
                });
                break;
            // 块级作用域{}
            case 'BlockStatement':
                childScope = new Scope({
                    parent: scope,
                    block: true,
                });
                break;
            // 变量声明
            case 'VariableDeclaration':
                node.declarations.forEach((variableDeclarator) => {
                    if (node.kind === 'let' || node.kind === 'const') {
                        addToScope(variableDeclarator, 'id', true);
                    } else {
                        addToScope(variableDeclarator, 'id', false);
                    }
                });
                break;
            // 类的声明
            case 'ClassDeclaration':
                addToScope(node, 'id', true);
                break;
            // import 的声明
            case 'ImportDeclaration':
                node.specifiers.forEach((specifier) => {
                    addToScope(specifier, 'local', true);
                });
                break;
        }

        if (childScope) {
            node._scope = childScope;
            scope = childScope;
        }
    },

    // 退出节点
    exit(path) {
        let {node} = path;
        if (node._scope) {
            scope = scope.parent;
        }
    },
});
console.timeEnd('ast');


traverse(ast, {
    enter(path) {
        let {node} = path;

        if (node._scope) {
            scope = node._scope;
        }

        if (t.isIdentifier(node) && !node._skip) {
            let defineScope = scope.findDefiningScope(node.name);
            if (defineScope) {
                defineScope.nodes[node.name]._used = 1;
            }
        }
    },
});

traverse(ast, {
    enter(path) {
        let {node} = path;

        if (node._used === 0) {
            path.remove();
        }
    },
});

const output = generate(
    ast,
    {
        /* options */
    },
    code
);

writeFile(
    path.resolve(__dirname, '../../example/index.shaking.js'),
    output.code
);


// function name(params) {
//     console.log(m);
// }

// name();
