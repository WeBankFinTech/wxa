import {
    Page,
    wxa,
} from '../../dist/wxa.js';
import common from '../../common';
// index.js
// 获取应用实例
const app = getApp();
let a = 1;

let i = Page(class Index {
    mixins = [common]
    data = {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
    }
    onLoad() {
        console.log('page index onLoad');
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true,
            });
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = (res) => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true,
                });
            };
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: (res) => {
                    app.globalData.userInfo = res.userInfo;
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true,
                    });
                },
            });
        }
    }
    onShow() {
        setTimeout(() => console.log(this, ++a), 1000);
    }
    methods = {
        // bindViewTap() {
        //     this.router.push('../logs/logs');
        // },
        getUserInfo(e) {
            console.log(e);
            app.globalData.userInfo = e.detail.userInfo;
            this.setData({
                userInfo: e.detail.userInfo,
                hasUserInfo: true,
            });
        },
    }
});

wxa.launch.page(i);
