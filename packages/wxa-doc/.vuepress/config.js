module.exports = {
    title: '@wxa',
    base: '/wxa-doc/',
    ga: 'UA-74795022-1',
    head: [
        ['link', { rel: 'icon', href: `/logo-mini.png` }],
    ],
    locales: {
        '/': {
            lang: 'zh-CN',
            selectText: '选择语言',
            label: '简体中文',
            description: 'wxa | 方便的小程序开发框架',
        },
        '/lang/english/': {
            lang: 'en-US',
            label: 'English',
            selectText: 'Languages',
            description: 'wxa | Wechat mini program framework'
        }
    },
    themeConfig: {
        repo: 'genuifx/wxa',
        docsRepo: 'genuifx/wxa-doc',
        editLinks: true,
        editLinkText: '帮助我们改善此页面！',
        locales: {
            '/': {
                lang: 'zh-CN',
                selectText: '选择语言',
                label: '简体中文',
                description: 'wxa | 方便的小程序开发框架',
                algolia: {},
                editLinkText: '在 GitHub 上编辑此页',
                nav: [
                    {text: '指南', link: '/guide/'},
                    {text: 'API', link: '/core'},
                    {text: '命令行工具', link: '/cli'},
                ],
            },
            '/lang/english/': {
                lang: 'en-US',
                label: 'English',
                selectText: 'Languages',
                description: 'wxa | mini program framework',
                algolia: {},
                editLinkText: 'Edit this page on GitHub',
                nav: [
                    {text: 'Guide', link: '/lang/english/guide'},
                    {text: 'API', link: '/lang/english/core'},
                    {text: 'CLI', link: '/lang/english/cli'},
                ],
            }
        },
        sidebar: {
            '/guide/': [
                '',
                'quickstart',
                'construction',
                'develop',
                'mixin',
                'component',
                'plugin',
                'editor'
            ]
        },
        evergreen: true
    }
}