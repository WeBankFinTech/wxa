import traverse from '@babel/traverse';
import * as t from '@babel/types';
import template from '@babel/template';
import path from 'path';
import DependencyResolver from '../../helpers/dependencyResolver';
import debugPKG from 'debug';
import logger from '../../helpers/logger';
import {generateCodeFromAST} from '../../compilers/script';

let debug = debugPKG('WXA:ASTManager');

export default class ASTManager {
    constructor(resolve, meta, wxaConfigs) {
        this.resolve = resolve;
        this.meta = meta;
        this.wxaConfigs = wxaConfigs;

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
        let importStatement = [
            t.callExpression.name,
            t.importDeclaration.name,
            t.exportAllDeclaration.name,
            t.exportNamedDeclaration.name].join('|');

        traverse(mdl.ast, {
            [importStatement]: (path) => {
                let dep;
                let typeOfPath;
                const StringLiteralRequire = 'StringLiteralRequire';
                const ImportDeclaration = 'ImportDeclaration';
                const ExportDeclaration = 'ExportDeclaration';

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
                } else if (
                    (t.isExportAllDeclaration(path.node) || t.isExportNamedDeclaration(path.node)) &&
                    t.isLiteral(path.node.source) &&
                    path.node.source.value
                ) {
                    dep = path.node.source.value;
                    typeOfPath = ExportDeclaration;
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
                            path.stop();
                            break;
                        case ImportDeclaration:
                            path.get('source').replaceWith(t.stringLiteral(resolved));
                            path.skip();
                            break;
                        case ExportDeclaration:
                            path.get('source').replaceWith(t.stringLiteral(resolved));
                            path.skip();
                            break;
                    }
                } catch (e) {
                    logger.error('解析失败', e);
                    debug('resolve fail %O', e);
                }
            },
            [t.ifStatement.name]: (path) => {
                // check Unreachable code
                this.checkUnreachableCode(path);
            },
            [t.assignmentExpression.name]: (path) => {
                // inject platform env to runtime app.
                if (
                    t.isMemberExpression(path.node.left) &&
                    t.isThisExpression(path.node.left.object) &&
                    t.isIdentifier(path.node.left.property, {name: '__WXA_PLATFORM__'})
                ) {
                    let rightExpressionPath = path.get('right');

                    rightExpressionPath.replaceWith(
                        t.stringLiteral(this.wxaConfigs.target)
                    );
                    // debugger;
                }
            },
        });

        debug('dependencies libs %O', libs);

        let wxaSourceLibs = this.scanComments(mdl.ast.comments, mdl);

        libs = libs.concat(wxaSourceLibs);
        // generate module code.
        let {code, map} = this.generate(mdl);
        mdl.code = code;
        // mdl.sourceMap = map;
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
        return generateCodeFromAST(mdl.ast, {}, mdl);
    }
}
