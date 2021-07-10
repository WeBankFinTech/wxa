module.exports = {
    entry: [
        {
            // 路径
            src: '',
            // 文件内容（可选）
            content: '',
        },
    ],
    resolveSrc: {
        // '/a/b/c'，绝对路径根目录
        // 例如src, '/a/b/c' 转换为 /src/a/b/b
        root: '',
        // {'@': 'src'}，路径别名
        alias: {},
        npm: 'node_modules',
    },
    commonJS: {
        enable: false,
        // 无法追踪动态引入的模块
        // 如果有模块被动态引入，需要在这里设置该模块路径
        // 将跳过对该模块的 cjs 转 esm
        dynamicRequireTargets: [],
        // 设置 exports 上的哪些属性不会被转换为 esm
        // 默认值有 '__esModule'
        ingoreKeys: [],
    },
    parseOptions: {
        plugins: [
            ['decorators', {decoratorsBeforeExport: true}],
            'classProperties',
            'jsx',
            'typescript',
            'exportNamespaceFrom',
            'exportDefaultFrom',
            'objectRestSpread',
        ],
        sourceType: 'unambiguous',
    },
};
