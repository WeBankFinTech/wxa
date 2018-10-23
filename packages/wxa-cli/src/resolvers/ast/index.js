import traverse from '@babel/traverse';
import * as t from '@babel/types';
import template from '@babel/template';
import generate from '@babel/generator';
import path from 'path';
import DependencyResolver from '../../helpers/dependencyResolver';
import debugPKG from 'debug';
import logger from '../../helpers/logger';

let debug = debugPKG('WXA:ASTManager');

export default class ASTManager {
    constructor(resolve, meta) {
        debug('resolve %o ', resolve);
        debug('meta %o ', meta);

        this.resolve = resolve;
        this.meta = meta;

        this.modulesPath = path.join(meta.current, 'node_modules');
        this.npmPath = path.join(meta.output.path, 'npm');
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
                    debug('callExpression %s %O', dep, mdl);
                } else if (
                    path.node.type === 'ImportDeclaration' &&
                    path.node.source &&
                    path.node.source.value
                ) {
                    dep = path.node.source.value;
                } else {
                    return;
                }

                try {
                    let dr = new DependencyResolver(self.resolve, self.meta);

                    let {source, pret, lib} = dr.resolveDep(dep, mdl, {needFindExt: true});
                    let outputPath = dr.getOutputPath(source, pret, mdl);
                    let resolved = dr.getResolved(lib, outputPath, mdl);

                    debug('%s output\'s resolved is %s output path is %s, and source is %s', dep, resolved, outputPath, source);
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
                } catch (e) {
                    logger.log('resolve fail', e);
                }
            },
        });

        libs.forEach((lib)=>{
            try {
                if (lib.reference.$$ASTPath) {
                    let path = lib.reference.$$ASTPath;
                    if (path.node.type === 'CallExpression') {
                        path.replaceWithSourceString(`require("${lib.reference.resolved}")`);
                    } else {
                        path.get('source').replaceWith(t.stringLiteral(lib.reference.resolved));
                    }
                }
            } catch (e) {
                console.error(e);
            }
        });
        debug('dependencies libs %O', libs);

        // generate module code.
        mdl.code = this.generate(mdl).code;
        return libs;
    }

    generate(mdl) {
        debug('generate start');
        if (mdl.ast == null) return;

        debug('module to generate %O', mdl.ast);
        return generate(mdl.ast, {});
    }
}
