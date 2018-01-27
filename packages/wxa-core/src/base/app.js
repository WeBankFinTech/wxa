// import {Eventbus, Wxapi} from '../utils/decorators';

let launch = function(instance) {
    let vm = instance;
    if (typeof instance === 'function') {
        vm = new instance();
    }

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

    // 复制methods
    if (vm.methods != null && typeof vm.methods === 'object') {
        Object.keys(vm.methods).forEach((key)=>{
            vm[key] = vm.methods[key];
        });
    }
    App(vm);
};

export {
    launch,
};
