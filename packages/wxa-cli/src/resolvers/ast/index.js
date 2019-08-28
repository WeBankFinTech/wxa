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
        this.resolve = resolve;
        this.meta = meta;

        this.modulesPath = path.join(meta.current, 'node_modules');
        this.npmPath = path.join(meta.output.path, 'npm');
    }

    scanComments(comments, mdl) {
        // match comment string like:
        // WXA_SOURCE_SRC= [../abc/cdb/hehe.js, ajijfidaf.s]
        // fallback for wxa 1.x
        let libs = [];

        comments.forEach((comment)=>{
            comment.value.replace(
                /(\.)?WXA_SOURCE_SRC\s*=\s*\[([\w\d_\-\.\/@\'\"\s\,]+)\]/igm,
                (match, point, arr)=> {
                    if (point) return match;

                    let source = arr.split(/[\'\"\,\s]/);

                    let set = new Set(source);

                    set.forEach((dep)=>{
                        if (dep == null || dep === '') return;

                        debug('find wxa source. %s', dep);
                        try {
                            let dr = new DependencyResolver(this.resolve, this.meta);

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
                            });
                        } catch (e) {
                            logger.error('解析失败', e);
                            debug('resolve fail %O', e);
                        }
                    });
                }
            );
        });

        return libs;
    }

    // traverse the entire AST,
    parse(mdl) {
        debug('parse start');
        if (mdl.ast == null) return [];

        let self = this;
        let libs = [];
        traverse(mdl.ast, {
            'CallExpression|ImportDeclaration': (path) => {
                let dep;
                let typeOfPath;
                const StringLiteralRequire = 'StringLiteralRequire';
                const ImportDeclaration = 'ImportDeclaration';

                // commandJS module
                if (
                    t.isCallExpression(path.node) &&
                    t.isIdentifier(path.node.callee, {name: 'require'}) &&
                    path.node.arguments.length
                ) {
                    let firstParam = path.node.arguments[0];
                    // debug(firstParam);
                    if ( t.isStringLiteral(firstParam) ) {
                        debug('callExpression %s', dep);
                        dep = firstParam.value;
                        typeOfPath = StringLiteralRequire;
                    } else {
                        // dynamic string is not support yet.
                        return;
                    }
                } else if (
                    t.isImportDeclaration(path.node) &&
                    path.node.source &&
                    path.node.source.value
                ) {
                    dep = path.node.source.value;
                    typeOfPath = ImportDeclaration;
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
                            source, outputPath, resolved,
                        },
                    });

                    switch (typeOfPath) {
                        case StringLiteralRequire:
                            // path.replaceWithSourceString(`require("${resolved}")`);
                            path.replaceWith( template(`require(SOURCE)`)({SOURCE: t.stringLiteral(resolved)}) );
                            break;
                        case ImportDeclaration:
                            path.get('source').replaceWith(t.stringLiteral(resolved));
                            break;
                    }
                    path.stop();
                } catch (e) {
                    logger.error('解析失败', e);
                    debug('resolve fail %O', e);
                }
            },
            'IfStatement': (path) => {
                // check Unreachable code
                this.checkUnreachableCode(path);
            },
        });

        debug('dependencies libs %O', libs);

        let wxaSourceLibs = this.scanComments(mdl.ast.comments, mdl);

        libs = libs.concat(wxaSourceLibs);
        // generate module code.
        mdl.code = this.generate(mdl).code;
        delete mdl.ast;
        return libs;
    }
    /**
     *
     *
     * @param {*} path
     * @memberof ASTManager
     */
    checkUnreachableCode(path) {
        try {
            let cond = path.get('test');

            const processCode = ()=>{
                const body = path.get('consequent');
                if (body && body.node.body) {
                    body.get('body.0').addComment('leading', 'Unreachable Code');
                    // save ast state and stop travel sub-childen tree.
                    path.stop();
                } else {
                    // just skip travelling.
                    path.skip();
                }
            };
            if (
                t.isLiteral(cond.node) &&
                !cond.node.value
            ) {
                // find simple situation, if ('') / if ( false );
                processCode();
            } else if (
                t.isBinaryExpression(cond) &&
                t.isLiteral(cond.node.left) &&
                t.isLiteral(cond.node.right) &&
                !eval(`${cond.node.left.extra.raw} ${cond.node.operator} ${cond.node.right.extra.raw}`)
            ) {
                processCode();
            }
        } catch (e) {
            logger.warn('Fail to check UnreachableCode');
        }
    }

    generate(mdl) {
        debug('generate start');
        if (mdl.ast == null) return;

        // debug('module to generate %O', mdl.ast);
        return generate(mdl.ast, {});
    }
}
