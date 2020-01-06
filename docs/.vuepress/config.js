var path = require('path')

module.exports = {
    title: '@wxa',
    base: '/wxa/',
    contentLoading: true,
    head: [
        ['link', { rel: 'icon', href: `/logo-mini.png` }],
    ],
    locales: {
        '/': {
            lang: 'zh-CN',
            selectText: '选择语言',
            label: '简体中文',
            description: 'wxa | AOP小程序框架',
        },
        // '/lang/english/': {
        //     lang: 'en-US',
        //     label: 'English',
        //     selectText: 'Languages',
        //     description: 'wxa | Wechat mini program framework'
        // }
    },
    themeConfig: {
        repo: 'wxajs/wxa',
        docsRepo: 'wxajs/wxa',
        docsDir: 'docs',
        editLinks: true,
        editLinkText: '帮助我们改善此页面！',
        sidebarDepth: 3,
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
                        text: '插件',
                        items: [
                            {
                                text: 'CORE 运行时插件',
                                items: [
                                    {text: 'Form', link: '/plugin/core/form'},
                                    {text: 'Watch', link: '/plugin/core/watch'},
                                    {text: 'Redux', link: '/plugin/core/redux'},
                                    {text: 'Log', link: '/plugin/core/log'},
                                ]
                            },
                            {
                                text: 'CLI 预编译插件',
                                items: [
                                    {text: 'Copy', link: '/plugin/cli/copy'},
                                    {text: 'Dependencies Analysis', link: '/plugin/cli/da'},
                                    {text: 'Postcss', link: '/plugin/cli/postcss'},
                                    {text: 'Replace', link: '/plugin/cli/replace'},
                                    {text: 'UglifyJS', link: '/plugin/cli/uglifyjs'},
                                ]
                            }
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
                    collapsable: false,
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
                    collapsable: false,
                    children: [
                        '/learn/advance/preload',
                        '/learn/advance/third-party-wxa'
                    ]
                },
                {
                    title: '其他',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: [
                        '/learn/other/migrade1.x',
                        '/learn/other/migradeNative'
                    ]
                }
            ],
            '/core/': [
                '',
                'global',
                {
                    title: '装饰器',
                    collapsable: false,
                    children: [
                        '/core/decorators/class',
                        '/core/decorators/methods',
                    ]
                },
                'hook',
                'feature',
                'other'
            ],
            '/cli/': [
                '',
                'build',
                'create',
                'tool',
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
        '@vuepress/back-to-top',
        '@vuepress/notification',
        '@vuepress/plugin-medium-zoom',
        'flowchart',
        ['@vuepress/google-analytics', {ga: 'UA-116900237-1'}],
        ['sitemap', { hostname: 'https://wxajs.github.io/wxa/'}]
    ],
    clientRootMixin: path.resolve(__dirname, 'mixin.js')
}