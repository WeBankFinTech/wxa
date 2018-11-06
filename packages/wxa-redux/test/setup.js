global.wx = {
    login(obj) {
        setTimeout(() => {
            obj.success && obj.success();
        }, 1000);
    },
};
global.getApp = function() {
    return {};
};
global.getCurrentPages = function() {
    return [{route: 'pages/index/index'}];
};

global.Page = ()=>{};
global.Component = ()=>{};
global.App = ()=>{};
