let state = require('./state.js');

function getKey(configKey) {
    return `${this.name}__e2e__${configKey.join('__e2e__')}`;
}
let mockWxMethodConfig = [
    {
        name: 'showModal',
        recordStringify(config) {
            return getKey.call(this, [
                config.title, config.content, config.editable, config.showCancel, config.confirmText,
            ]);
        },
        tpl: (() => {
            let key = ['config.title || ""', 'config.content || ""', 'config.editable || ""', 'config.showCancel || ""', 'config.confirmText || ""'];
            return `showModal__e2e__\${${key.join('}__e2e__${')}}`;
        })(),
    },
    {
        name: 'showActionSheet',
        recordStringify(config) {
            return getKey.call(this, [
                config.alertText, config.itemColor, config.itemList.join(','),
            ]);
        },
        tpl: (() => {
            let key = ['config.alertText  || ""', 'config.itemColor || ""', 'config.itemList.join(",") || ""'];
            return `showActionSheet__e2e__\${${key.join('}__e2e__${')}}`;
        })(),
    },
    {
        name: 'request',
        recordStringify(config) {
            console.log(getKey.call(this, [
                config.url, config.method, Object.keys(config.data || {}).join(','),
            ]));
            return getKey.call(this, [
                config.url.split('?')[0], config.method, Object.keys(config.data || {}).join(','),
            ]);
        },
        tpl: (() => {
            let key = ['(config.url && config.url.split("?")[0])  || ""', 'config.method  || ""', 'Object.keys(config.data || {}).join(",")  || ""'];
            return `request__e2e__\${${key.join('}__e2e__${')}}`;
        })(),
    },
];
module.exports = {
    mock: function({state}) {
        mockWxMethodConfig.forEach((item) => {
            let originMethod = wx[item.name];
            Object.defineProperty(wx, item.name, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function() {
                    const config = arguments[0] || {};
                    let {recording, apiRecord} = state;
                    if (recording) {
                        let key = item.recordStringify(config);
                        if (!apiRecord.has(key)) {
                            apiRecord.set(key, []);
                        }
                        let originSuccess = config.success;
                        config.success = function() {
                            const res = arguments[0] || {};
                            apiRecord.get(key).push(JSON.parse(JSON.stringify(res)));

                            originSuccess.apply(this, arguments);
                        };
                        return originMethod.apply(this, arguments);
                    }
                    return originMethod.apply(this, arguments);
                },
            });
        });
    },
    config: mockWxMethodConfig,
};
