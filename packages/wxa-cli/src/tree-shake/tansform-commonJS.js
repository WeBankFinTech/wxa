const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
let {check} = require('reserved-words');
const {readFile, writeFile, parseESCode} = require('./util');
let t = require('@babel/types');
let path = require('path');

const state = {
    globals: new Set(),
    renamed: new Map(),
    identifiers: new Set(),
    isCJS: false,
};

const enter = (path) => {
    let cursor = path;

    // Find the closest function scope or parent.
    do {
        // Ignore block statements.
        if (t.isBlockStatement(cursor.scope.path)) {
            continue;
        }

        if (t.isFunction(cursor.scope.path) || t.isProgram(cursor.scope.path)) {
            break;
        }
    } while ((cursor = cursor.scope.path.parentPath));

    if (t.isProgram(cursor.scope.path)) {
        const nodes = [];
        const inner = [];

        // Break up the program, separate Nodes added by us from the nodes
        // created by the user.
        cursor.scope.path.node.body.filter((node) => {
            // Keep replaced nodes together, these will not be wrapped.
            if (node.__replaced) {
                nodes.push(node);
            } else {
                inner.push(node);
            }
        });

        const program = t.program([
            ...nodes,
            t.expressionStatement(
                t.callExpression(
                    t.memberExpression(
                        t.functionExpression(null, [], t.blockStatement(inner)),
                        t.identifier('call')
                    ),
                    [t.identifier('module.exports')]
                )
            ),
        ]);

        cursor.scope.path.replaceWith(program);
        state.isCJS = true;
    }
};

function transform(ast, options = {}) {
    traverse(ast, {
        Program: {
            exit(path) {
                path.traverse({
                    CallExpression: {
                        exit(path) {
                            const {node} = path;

                            // Look for `require()` any renaming is assumed to be intentionally
                            // done to break state kind of check, so we won't look for aliases.
                            if (
                                !options.exportsOnly &&
                                t.isIdentifier(node.callee) &&
                                node.callee.name === 'require'
                            ) {
                                // Require must be global for us to consider this a CommonJS
                                // module.
                                state.isCJS = true;

                                // Check for nested string and template literals.
                                const isString = t.isStringLiteral(
                                    node.arguments[0]
                                );
                                const isLiteral = t.isTemplateLiteral(
                                    node.arguments[0]
                                );

                                // Normalize the string value, default to the standard string
                                // literal format of `{ value: "" }`.
                                let str = null;

                                if (isString) {
                                    str = node.arguments[0];
                                } else if (isLiteral) {
                                    str = {
                                        value: node.arguments[0].quasis[0].value
                                            .raw,
                                    };
                                } else if (options.synchronousImport) {
                                    const str = node.arguments[0];
                                    const newNode = t.expressionStatement(
                                        t.callExpression(t.import(), [str])
                                    );

                                    // @ts-ignore
                                    newNode.__replaced = true;

                                    path.replaceWith(newNode);

                                    return;
                                } else {
                                    throw new Error(
                                        `Invalid require signature: ${path.toString()}`
                                    );
                                }

                                const specifiers = [];

                                // Convert to named import.
                                if (
                                    t.isObjectPattern(path.parentPath.node.id)
                                ) {
                                    path.parentPath.node.id.properties.forEach(
                                        (prop) => {
                                            specifiers.push(
                                                t.importSpecifier(
                                                    prop.value,
                                                    prop.key
                                                )
                                            );

                                            state.globals.add(prop.value.name);
                                        }
                                    );

                                    const decl = t.importDeclaration(
                                        specifiers,
                                        t.stringLiteral(str.value)
                                    );

                                    // @ts-ignore
                                    decl.__replaced = true;

                                    path.scope
                                        .getProgramParent()
                                        .path.unshiftContainer('body', decl);
                                    path.parentPath.remove();
                                } else if (str) {
                                    // Convert to default import.

                                    const {parentPath} = path;
                                    const {left} = parentPath.node;
                                    // @ts-ignore
                                    const oldId = !t.isMemberExpression(left)
                                        ? left
                                        : left.id;

                                    // Default to the closest likely identifier.
                                    let id = oldId;

                                    // If we can't find an id, generate one from the import path.
                                    if (
                                        !oldId ||
                                        !t.isProgram(parentPath.scope.path.type)
                                    ) {
                                        id = path.scope.generateUidIdentifier(
                                            str.value
                                        );
                                    }

                                    // Add state global name to the list.
                                    state.globals.add(id.name);

                                    // Create an import declaration.
                                    const decl = t.importDeclaration(
                                        [t.importDefaultSpecifier(id)],
                                        t.stringLiteral(str.value)
                                    );

                                    // @ts-ignore
                                    decl.__replaced = true;

                                    // Push the declaration in the root scope.
                                    path.scope
                                        .getProgramParent()
                                        .path.unshiftContainer('body', decl);

                                    // If we needed to generate or the change the id, then make an
                                    // assignment so the values stay in sync.
                                    if (
                                        oldId &&
                                        !t.isNodesEquivalent(oldId, id)
                                    ) {
                                        const newNode = t.expressionStatement(
                                            t.assignmentExpression(
                                                '=',
                                                oldId,
                                                id
                                            )
                                        );

                                        // @ts-ignore
                                        newNode.__replaced = true;

                                        path.parentPath.parentPath.replaceWith(
                                            newNode
                                        );
                                    } else if (!oldId) {
                                        // If we generated a new identifier for state, replace the inline
                                        // call with the variable.
                                        path.replaceWith(id);
                                    } else {
                                        // Otherwise completely remove.

                                        path.parentPath.remove();
                                    }
                                }
                            }
                        },
                    },
                });

                const programPath = path.scope.getProgramParent().path;

                // Even though we are pretty sure this isn't a CommonJS file, lets
                // do one last sanity check for an `import` or `export` in the
                // program path.
                if (!state.isCJS) {
                    const lastImport = programPath
                        .get('body')
                        .filter((p) => p.isImportDeclaration())
                        .pop();

                    const lastExport = programPath
                        .get('body')
                        .filter((p) => p.isExportDeclaration())
                        .pop();

                    // Maybe it is a CJS file after-all.
                    if (!lastImport && !lastExport) {
                        state.isCJS = true;
                    }
                }

                if (path.node.__replaced || !state.isCJS) {
                    return;
                }

                const exportsAlias = t.variableDeclaration('var', [
                    t.variableDeclarator(
                        t.identifier('exports'),
                        t.memberExpression(
                            t.identifier('module'),
                            t.identifier('exports')
                        )
                    ),
                ]);

                const moduleExportsAlias = t.variableDeclaration('var', [
                    t.variableDeclarator(
                        t.identifier('module'),
                        t.objectExpression([
                            t.objectProperty(
                                t.identifier('exports'),
                                t.objectExpression([])
                            ),
                        ])
                    ),
                ]);

                // @ts-ignore
                exportsAlias.__replaced = true;
                // @ts-ignore
                moduleExportsAlias.__replaced = true;

                // Add the `module` and `exports` globals into the program body,
                // after the last `import` declaration.
                const lastImport = programPath
                    .get('body')
                    .filter((p) => p.isImportDeclaration())
                    .pop();

                if (lastImport) {
                    lastImport.insertAfter(exportsAlias);
                    lastImport.insertAfter(moduleExportsAlias);
                } else {
                    programPath.unshiftContainer('body', exportsAlias);
                    programPath.unshiftContainer('body', moduleExportsAlias);
                }

                const defaultExport = t.exportDefaultDeclaration(
                    t.memberExpression(
                        t.identifier('module'),
                        t.identifier('exports')
                    )
                );

                path.node.__replaced = true;
                // @ts-ignore
                defaultExport.__replaced = true;

                programPath.pushContainer('body', defaultExport);
            },
        },
        ThisExpression: {enter},
        ReturnStatement: {enter},

        ImportSpecifier: {
            enter(path) {
                const {name} = path.node.local;

                // If state import was renamed, ensure the source reflects it.
                if (state.renamed.has(name)) {
                    const oldName = t.identifier(name);
                    const newName = t.identifier(state.renamed.get(name));

                    path.replaceWith(t.importSpecifier(newName, oldName));
                }
            },
        },

        AssignmentExpression: {
            enter(path) {
                if (path.node.__ignore) {
                    return;
                }

                path.node.__ignore = true;

                // Check for module.exports.
                if (t.isMemberExpression(path.node.left)) {
                    const moduleBinding = path.scope.getBinding('module');
                    const exportsBinding = path.scope.getBinding('exports');

                    // Something like `module.exports.namedExport = true;`.
                    if (
                        t.isMemberExpression(path.node.left.object) &&
                        path.node.left.object.object.name === 'module'
                    ) {
                        if (!moduleBinding) {
                            state.isCJS = true;
                            return;
                        }
                    } else if (
                        t.isIdentifier(path.node.left.object) &&
                        path.node.left.object.name === 'module'
                    ) {
                        if (!moduleBinding) {
                            state.isCJS = true;

                            // Looking at a re-exports, handled above.
                            if (t.isCallExpression(path.node.right)) {
                                return;
                            }
                        }
                    } else if (path.node.left.object.name === 'exports') {
                        // Check for regular exports
                        const {name} = path.node.left.property;
                        if (
                            exportsBinding ||
                            // If export is named "default" leave as is.
                            // It is not possible to export "default" as a named export.
                            // e.g. `export.default = 'a'`
                            name === 'default'
                        ) {
                            return;
                        }

                        state.isCJS = true;

                        let prop = path.node.right;

                        if (
                            (path.scope
                                .getProgramParent()
                                .hasBinding(prop.name) ||
                                state.globals.has(prop.name)) &&
                            // Don't rename `undefined`.
                            prop.name !== 'undefined'
                        ) {
                            prop = path.scope.generateUidIdentifier(prop.name);

                            const oldName = path.node.right.name;
                            state.renamed.set(oldName, prop.name);

                            // Add this new identifier into the globals and replace the
                            // right hand side with this replacement.
                            state.globals.add(prop.name);
                            path.get('right').replaceWith(prop);
                            path.scope.rename(oldName, prop.name);
                        }

                        // If we set an invalid name, then abort out.
                        try {
                            // Ensure that the scope is clean before we inject new,
                            // potentially conflicting, variables.
                            const newName =
                                path.scope.generateUidIdentifier(name).name;

                            path.scope.rename(name, newName);

                            // Check if this name is reserved, if so, then bail out.
                            if (check(name)) {
                                return;
                            }

                            const decl = t.exportNamedDeclaration(
                                t.variableDeclaration('let', [
                                    t.variableDeclarator(
                                        path.node.left.property,
                                        t.memberExpression(
                                            t.identifier('exports'),
                                            path.node.left.property
                                        )
                                    ),
                                ]),
                                []
                            );

                            if (!state.identifiers.has(name)) {
                                path.scope
                                    .getProgramParent()
                                    .path.pushContainer('body', decl);
                                state.identifiers.add(name);
                            }
                        } catch {}
                    }
                }
            },
        },
    });
}

let code = readFile(path.resolve(__dirname, './transform-test.js'));
let ast = parseESCode(code);

transform(ast);

const {code: outputCode} = generate(
    ast,
    {
        /* options */
        decoratorsBeforeExport: true,
    },
    code
);

writeFile(
    path.resolve(path.resolve(__dirname, './transform-test-a.js')),
    outputCode
);
