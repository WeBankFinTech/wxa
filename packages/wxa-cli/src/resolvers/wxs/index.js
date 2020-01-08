import debugPKG from 'debug';
import traverse from '@babel/traverse';
import generator from '@babel/generator';
import * as types from '@babel/types';
import DependencyResolver from '../../helpers/dependencyResolver';
import logger from '../../helpers/logger';

const debug = debugPKG('WXA:ASTManager');

export default function extractDependencies(
    mdl,
    resolve,
    meta
) {
    debug('parse start');
    if (mdl.ast == null) return [];
    const dependencies = analyzeDependencies(mdl.ast);
    const resolver = new DependencyResolver(resolve, meta);
    const libs = dependencies.map((dependency) => resolveDependency(resolver, dependency, mdl));
    mdl.code = generate(mdl);
    delete mdl.ast;
    return libs;
}

function analyzeDependencies(ast) {
    const dependencies = [];
    traverse(ast, {
        'CallExpression': (path) => {
            if (isDependencyRequire(path.node)) {
                const firstParam = path.node.arguments[0];
                if (types.isStringLiteral(firstParam) ) {
                    debug('callExpression %s', firstParam.value);
                    dependencies.push(firstParam.value);
                }
            }
        },
    });
    return dependencies;
}

/**
 * AST node 是否是在引用依赖
 * @param {*} node 
 * @return {Boolean}
 */
function isDependencyRequire(node) {
    return types.isCallExpression(node) &&
        types.isIdentifier(node.callee, {name: 'require'}) &&
        node.arguments.length;
}

function resolveDependency(resolver, dependency, mdl) {
    const {source, pret, lib} = resolver.resolveDep(dependency, mdl, {needFindExt: true});
    failIfNotRelative(pret.isRelative, source);
    const outputPath = resolver.getOutputPath(source, pret, mdl);
    const resolved = resolver.getResolved(lib, outputPath, mdl);
    return {
        src: source,
        pret: pret,
        meta: {
            source, outputPath, resolved,
        },
    };
}

/**
 * wxs 文件中的 require 仅接受相对路径
 * https://developers.weixin.qq.com/miniprogram/dev/reference/wxs/01wxs-module.html#require%E5%87%BD%E6%95%B0
 * @param {Boolean} isRelative
 * @param {*} source
 */
function failIfNotRelative(isRelative, source) {
    if (isRelative) return;
    logger.error(`wxs 中仅允许 require 相对路径: ${source} (https://developers.weixin.qq.com/miniprogram/dev/reference/wxs/01wxs-module.html#require%E5%87%BD%E6%95%B0)`);
}

function generate(mdl) {
    debug('generate start');
    if (mdl.ast == null) return;

    debug('generating wxs %O', mdl.ast);
    return generator(mdl.ast, {}).code;
}
