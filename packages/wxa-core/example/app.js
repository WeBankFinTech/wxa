import {
    App,
    wxa,
} from './dist/wxa.js';
import {
    createStore,
    combineReducers,
} from './redux/lib/index';

wxa.use((options, type) => {
    return (vm) => {
        vm.applicationName = type + ' Wxa from ' + options.name;
    };
}, {
    name: 'Genuifx',
});

let todo = (state=[], action)=>{
    let n;
    switch (action.type) {
        case 'Add': {
            n = [...state, action.payload];
            break;
        }
        default: n = state;
    }
    return n;
};
let user = (state={}, action)=>{
    switch (action.type) {
        case 'Update': {
            return Object.assign({}, state, action.payload);
        }
        default: return state;
    }
};
wxa.use((reducers, type)=>{
    return (vm)=>{
        if (type === 'App') {
            vm.store = createStore(reducers);
        } else {
            if (vm.app == null) throw new Error('wxa-redux需要使用@GetApp修饰符');
            vm.store = vm.app.store;
        }
    };
}, combineReducers({
    todo,
    user,
}));

// app.js
let i = App(
    class Main {
        onLaunch() {
            // 展示本地存储能力
            let logs = wx.getStorageSync('logs') || [];
            logs.unshift(Date.now());
            wx.setStorageSync('logs', logs);

            // 登录
            wx.login({
                success: (res) => {
                    // 发送 res.code 到后台换取 openId, sessionKey, unionId
                },
            });
            // 获取用户信息
            wx.getSetting({
                success: (res) => {
                    if (res.authSetting['scope.userInfo']) {
                        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                        wx.getUserInfo({
                            success: (res) => {
                                // 可以将 res 发送给后台解码出 unionId
                                this.globalData.userInfo = res.userInfo;

                                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                                // 所以此处加入 callback 以防止这种情况
                                if (this.userInfoReadyCallback) {
                                    this.userInfoReadyCallback(res);
                                }
                            },
                        });
                    }
                },
            });
        }
        onShow() {
            setTimeout(() => {
                console.log(this.applicationName);
            });
        }
        globalData = {
            userInfo: null,
        }
        hello() {
            console.log('');
        }
    }
);

wxa.launch.app(i);
