var path = require('path')

module.exports = {
    title: 'wxa.js',
    base: '/wxa/',
    contentLoading: true,
    head: [
        ['link', { rel: 'icon', href: `/wxajs.png` }],
    ],
    locales: {
        '/': {
            lang: 'zh-CN',
            selectText: '选择语言',
            label: '简体中文',
            description: '渐进式小程序开发框架',
        },
        // '/lang/english/': {
        //     lang: 'en-US',
        //     label: 'English',
        //     selectText: 'Languages',
        //     description: 'wxa | Wechat mini program framework'
        // }
    },
    markdown: {
        lineNumbers: true
    },
    theme: './theme',
    themeConfig: {
        // logo: 'wxajs-color.svg',
        displayAllHeaders: true,
        // repo: 'WeBankFinTech/wxa',
        docsRepo: 'WeBankFinTech/wxa',
        docsDir: 'docs',
        editLinks: true,
        editLinkText: '帮助我们改善此页面！',
        sidebarDepth: 2,
        locales: {
            '/': {
                lang: 'zh-CN',
                selectText: '选择语言',
                label: '简体中文',
                description: 'wxa | 方便的小程序开发框架',
                algolia: {},
                editLinkText: '在 GitHub 上编辑此页',
                lastUpdated: '上次编辑时间',
                sidebarDepth: 4,
                nav: [
                    {text: '教程', link: '/learn/guide/'},
                    {text: 'CORE', link: '/core/'},
                    {text: 'CLI', link: '/cli/'},
                    {
                        text: 'CORE 运行时插件',
                        items: [
                            {text: 'Validate 表单校验', link: '/plugin/core/validate'},
                            {text: 'Watch 数据监听', link: '/plugin/core/watch'},
                            {text: 'Redux 全局状态管理', link: '/plugin/core/redux'},
                            {text: 'Log 日志上报', link: '/plugin/core/log'},
                        ]
                    },
                    {
                        text: 'CLI 预编译插件',
                        items: [
                            {text: 'UglifyJS 代码压缩', link: '/plugin/cli/uglifyjs'},
                            {text: 'Replace 字符替换', link: '/plugin/cli/replace'},
                            {text: 'Copy 静态资源引入', link: '/plugin/cli/copy'},
                            {text: 'hijack 事件劫持', link: '/plugin/cli/hijack'},
                            {text: 'Minify-wxml wxml压缩', link: '/plugin/cli/minify-wxml'},
                            {text: 'Postcss CSS预处理', link: '/plugin/cli/postcss'},
                            {text: 'DA 依赖分析', link: '/plugin/cli/da'},
                        ]
                    }
                ],
            },
        },
        sidebar: {
            '/learn/': [
                '/learn/quickStarted/',
                {
                    title: '指南',
                    collapsable: true,
                    sidebarDepth: 1,
                    children: [
                        '/learn/guide/',
                        '/learn/guide/construction',
                        '/learn/guide/develop',
                        '/learn/guide/mixin',
                        '/learn/guide/component',
                        '/learn/guide/plugin',
                        '/learn/guide/editor'
                    ]
                },
                {
                    title: '进阶',
                    collapsable: true,
                    sidebarDepth: 0,
                    children: [
                        '/learn/advance/preload',
                        '/plugin/core/redux',
                        '/learn/advance/watch-computed',
                        '/learn/advance/third-party-wxa',
                        '/learn/advance/wxa-directive',
                    ]
                },
                {
                    title: '其他',
                    collapsable: true,
                    sidebarDepth: 1,
                    children: [
                        '/learn/other/migrade1.x',
                        '/learn/other/migradeNative'
                    ]
                }
            ],
            '/core/': [
                '', 
                'API'
            ],
            '/cli/': [
                '',
                'command',
                'configuration'
            ]
        },
        evergreen: true
    },
    plugins: [
        ['@vuepress/pwa', {
            serviceWorker: true,
            updatePopup: {
                message: "文档有更新",
                buttonText: "刷新"
            }
        }],
        [
            '@vuepress/last-updated',
            {
              transformer: (timestamp, lang) => {
                return new Date(timestamp).toLocaleDateString();
              }
            }
        ],
        '@vuepress/back-to-top',
        '@vuepress/notification',
        '@vuepress/plugin-medium-zoom',
        'flowchart',
        ['@vuepress/google-analytics', {ga: 'UA-116900237-1'}],
        ['sitemap', { hostname: 'https://webankfintech.github.io/wxa/'}]
    ],
    // clientRootMixin: path.resolve(__dirname, 'mixin.js')
}