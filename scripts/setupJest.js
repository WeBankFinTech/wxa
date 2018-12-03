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

global.Page = ()=>{};
global.Component = ()=>{};
global.App = ()=>{};

/**
 * { a: { b: 1 } } { 'a.b': 1 } { 'a.b[1].v': 1 }
 *    
 * @param {*} obj 
 */
// let setData = function(obj) {

//     let keys = Object.keys(obj);
//     let ret = {};

//     keys.forEach((key)=>{

//         if ( !/[\.\[\]]/.test( field ) ) {
//             ret[ key ] = obj[ key ];
//         } else {
//             let current = ret;
//             let oldValue = this.data;
//             let newValue = obj;

//             key.split('.').forEach((field, idx, keyArr)=>{
//                 if (/[\[\]]/.test(field)) {
//                     let [match, arr, index] = /([^\[\]])+\[(\d+)\][^\[\]]*/.exec(field);

//                 } else {
//                     // 没数组
//                     newValue = newValue[ field ];
//                     oldValue = oldValue[ field ];

//                     if( typeof oldValue !== 'object' ) {
//                         current[ field ] = {};
//                     } else {
//                         current[ field ] = oldValue;
//                     }
//                 }
//             })
//         }
//     });
// }
