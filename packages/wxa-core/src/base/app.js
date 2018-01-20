import {Eventbus, Wxapi} from '../utils/decorators';

module.exports.launch = function(instance) {
    let vm = instance;
    if (typeof instance === 'function') {
        instance = Eventbus(instance);
        instance = Wxapi(instance);
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

    // console.dir(vm);

    App(vm);
};
