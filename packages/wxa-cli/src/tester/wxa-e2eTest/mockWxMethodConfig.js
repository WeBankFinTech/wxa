function getKey(configKey) {
    return `${this.name}__e2e__${configKey.join('__e2e__')}`
}
export default [
        {
            name: 'showModal',
            recordStringify(config) {
                return getKey.call(this, [
                    config.title, config.content, config.editable, config.showCancel, config.confirmText
                ])
            },
            tpl: (() => {
                let key = ['config.title || ""', 'config.content || ""', 'config.editable || ""', 'config.showCancel || ""', 'config.confirmText || ""']
                return `showModal__e2e__\${${key.join('}__e2e__${')}}`
            })()
        },
        {
            name: 'showActionSheet',
            recordStringify(config) {
                return getKey.call(this, [
                    config.alertText, config.itemColor, config.itemList.join(',')
                ])
            },
            tpl: (() => {
                let key = ['config.alertText  || ""', 'config.itemColor || ""', 'config.itemList.join(",") || ""']
                return `showActionSheet__e2e__\${${key.join('}__e2e__${')}}`
            })()
        },
        {
            name: 'request',
            recordStringify(config) {
                console.log(getKey.call(this, [
                    config.url, config.method, Object.keys(config.data || {}).join(',')
                ]));
                return getKey.call(this, [
                    config.url, config.method, Object.keys(config.data || {}).join(',')
                ])
            },
            tpl: (() => {
                let key = ['config.url  || ""', 'config.method  || ""', 'Object.keys(config.data).join(",")  || ""']
                return `request__e2e__\${${key.join('}__e2e__${')}}`
            })()
        }
    ]
