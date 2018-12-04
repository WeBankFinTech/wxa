import regeneratorRuntime from "regenerator-runtime";

global.regeneratorRuntime = regeneratorRuntime;

global.wx = {
    login(obj) {
        setTimeout(() => {
            obj.success && obj.success();
        }, 1000);
    },
    showLoading() {},
    hideLoading() {},
    showNavigationBarLoading() {},
    hideNavigationBarLoading() {},
};

global.getApp = function() {
    return {};
};

global.getCurrentPages = function() {
    return [{route: 'pages/index/index'}];
};

global.Page = ()=>{setData};
global.Component = ()=>{setData};
global.App = ()=>{setData};

global.setData = function setData(obj) {

    let keys = Object.keys(obj);
    let ret = this.data;

    keys.forEach(key => { //key可能是a["b"]['c']["d"].e.f.g['h']
        let keyArr = key.split(/\[|\]|\.|\'|\"/).filter(k => k); // ["a", "b", "c", "d", "e", "f", "g", "h"]
        let curr = ret;
        keyArr.forEach((val, index, array) => {
            if (index == array.length - 1) {
                return curr[val] = obj[key];
            }
            if (!curr[val]) {
                curr[val] = {}
            }
            curr = curr[val];
        })
    });
}
//setData({'a[\'bl\'].b[\'c\'][\"d\"][1][2]':1,'e.r.d.d.a[\'hhh\"]':12,'a[bl].b[decode][c][d]':1,})