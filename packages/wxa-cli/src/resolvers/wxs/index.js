import debugPKG from 'debug';
import traverse from '@babel/traverse';
import generator from '@babel/generator';
import * as types from '@babel/types';
import DependencyResolver from '../../helpers/dependencyResolver';
import logger from '../../helpers/logger';

const debug = debugPKG('WXA:WxsResolver');

export default function resolveWxsDependencies(
    mdl,
    resolve,
    meta
) {
    debug('Resolving %O', mdl.src);
    if (mdl.ast == null) return [];
    const dependencies = findDependencies(mdl.ast);
    const libs = resolveDependencies(dependencies, mdl, resolve, meta);
    deriveCodeFromAst(mdl); // FIXME: 放 Resolve 阶段不太合适
    debug('Resolved %O', mdl.src);
    return libs;
}

function findDependencies(ast) {
    const dependencies = [];
    traverse(ast, {
        'CallExpression': (path) => {
            if (isDependencyRequire(path.node)) {
                const firstParam = path.node.arguments[0];
                if (types.isStringLiteral(firstParam) ) {
                    debug('Found Dependency: %O', firstParam.value);
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

function resolveDependencies(dependencies, mdl, resolve, meta) {
    const resolver = new DependencyResolver(resolve, meta);
    return dependencies.map((dependency) => resolveDependency(resolver, dependency, mdl));
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

function deriveCodeFromAst(mdl) {
    if (mdl.ast == null) return;
    mdl.code = generator(mdl.ast, {}).code;
    delete mdl.ast;
}
