import {Eventbus, Promisify} from '../utils/decorators';
import debounce from '../utils/debounce';
// const merge = require('../utils/deep-merge');

module.exports.launch = function(instance) {
    let vm = instance;
    if (typeof instance === 'function') {
        vm = new instance();
    }
    vm.$go = (()=>{
        return debounce(function(e) {
            let {currentTarget: {dataset: {path, type}}} = e;
            let category = 'push';
            if (type) category = type;
            this.router[category](path);
        }, 220);
    })();
    vm.onShareAppMessage = vm.onShareAppMessage || function() {
        let pages = getCurrentPages();
        return {
            success: function() {
                try {
                    vm.logger.clickStat('share', pages[pages.length-1].route);
                } catch (e) {
                    console.error(e);
                }
            },
        };
    };
    // if(vm.mixins) {
    //     let mixins = vm.mixins;
    //     delete vm.mixins;

    //     let data = vm.data;
    //     // data = mixins.reduce((p, m)=>merge(p, m.data||{}), data);
    //     console.log(vm)
    //     let sub = mixins.reduce((p, m)=>(console.log(p,m), Object.assign(p, m)), {});
    //     vm = Object.assign(sub, vm);
    //     // vm.data = data;
    // }

    // console.dir(vm);

    Page(vm);
};
