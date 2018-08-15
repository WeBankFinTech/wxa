import traverse from '@babel/traverse';
import * as t from '@babel/types';
import template from '@babel/template';
import generate from '@babel/generator';
import path from 'path';
import PathParser from '../helpers/pathParser';
import {getDistPath, isFile, readFile, isDir} from '../utils';
import findRoot from 'find-root';
import resolveAlias from '../helpers/alias';
import DependencyResolver from '../helpers/dependencyResolver';
import debugPKG from 'debug';

let debug = debugPKG('WXA:ASTManager');

export default class ASTManager {
    constructor(resolve, meta) {
        debug('resolve %o ', resolve);
        debug('meta %o ', meta);

        this.resolve = resolve;
        this.meta = meta;

        this.modulesPath = path.join(meta.current, 'node_modules', path.sep);
        this.npmPath = path.join(meta.current, meta.dist, 'npm', path.sep);
    }

    parse(mdl) {
        debug('parse start');
        if (mdl.ast == null) return [];

        let self = this;
        let libs = [];
        traverse(mdl.ast, {
            'CallExpression|ImportDeclaration'(path) {
                let dep;
                // commandJS module
                if (
                    path.node.type === 'CallExpression' &&
                    path.node.callee &&
                    path.node.callee.name === 'require' &&
                    path.node.arguments.length
                ) {
                    dep = path.node.arguments[0].value;
                    debug('callExpression %s', dep);
                } else if (
                    path.node.type === 'ImportDeclaration' &&
                    path.node.source &&
                    path.node.source.value
                ) {
                    dep = path.node.source.value;
                } else {
                    return;
                }

                let dr = new DependencyResolver(self.resolve, self.meta);

                let {source, pret, lib} = dr.resolveDep(dep, mdl, {needFindExt: true});
                let outputPath = dr.getOutputPath(source, pret, mdl);
                let resolved = dr.getResolved(lib, source, outputPath, mdl);

                debug('%s output\'s resolved is %s', dep, resolved);
                libs.push({
                    src: source,
                    pret: pret,
                    meta: {
                        source, outputPath,
                    },
                    reference: {
                        $$ASTPath: path,
                        $$category: 'ast',
                        resolved,
                    },
                });

                if (path.node.type === 'CallExpression') {
                    console.log(resolved);
                    path.replaceWithSourceString(`require("${resolved}")`);
                } else {
                    path.get('source').replaceWith(t.stringLiteral(resolved));
                }
            },
        });

        debug('dependencies libs %O', libs);
        return libs;
    }

    generate(mdl) {
        debug('generate start');
        if (mdl.ast == null) return;

        debug('module to generate %O', mdl.ast);
        return generate(mdl.ast, {});
    }
}
