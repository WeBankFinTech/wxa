var langs = [
    {title: 'English', path: '/lang/english/'},
    {title: '简体中文', path: '/home'}
]

var $config = {
    landing: true,
    debug: true,
    repo: 'Genuifx/wxa',
    twitter: 'zetianwen',
    nav: {
        default: [
            {title: '首页', path: '/home'},
            {title: '核心', path: '/core'},
            {title: '命令行工具', path: '/cli'},
            {
                title: '语言', type: 'dropdown', items: langs
            }
        ],
        english: [
            {title: 'Home', path: '/lang/english/'},
            {title: 'Core', path: '/lang/english/core'},
            {title: 'Cli', path: '/lang/english/cli'},
            {
                title: '语言', type: 'dropdown', items: langs
            }
        ]
    },
    plugins: [
        // evanyou(),
        disqus({
            shortname: 'wxa'
        })
    ]
}

docute.init($config)
// var doc = new Docute({
//     $config
// });

// doc.start('#app')