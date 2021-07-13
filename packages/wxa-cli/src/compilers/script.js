import {readFile} from '../utils';
import logger from '../helpers/logger';
import generator from '@babel/generator';
import {parse} from '@babel/parser';
import {wxaPerformance} from '../helpers/performance';

export default class scriptCompiler {
    parse(filepath, code, configs) {
        if (code == null) code = readFile(filepath);

        if (code == null) logger.error(`文件不存在, ${filepath}`);

        let ast;
        try {
            wxaPerformance.markStart('wxa_dep_analysis-dep-parse-babel ' + filepath);
            ast = parseESCode(code, [], configs);
            wxaPerformance.markEnd('wxa_dep_analysis-dep-parse-babel ' + filepath);
        } catch (e) {
            logger.error('编译失败', e);
            return Promise.reject(e);
        }

        return Promise.resolve({
            ast,
            kind: 'js',
        });
    }
}

export function parseESCode(code, plugins = [], options) {
    plugins = [
        ['decorators', {decoratorsBeforeExport: true}],
        'classProperties',
        'jsx',
        'typescript',
        'exportNamespaceFrom',
        'exportDefaultFrom',
        'objectRestSpread',
        ...plugins,
    ];

    return parse(
        code,
        {
            plugins,
            sourceType: 'unambiguous',
            ...options,
        }
    );
}

export function generateCodeFromAST(ast, options = {}, mdl) {
    let opts = {};
    if (mdl.isNodeModule || mdl.isWXARuntime) {
        opts.concise = true;
        opts.compact = true;
        opts.minified = true;
    }

    opts = {...opts, ...options};

    return generator(ast, opts, mdl.content);
}
