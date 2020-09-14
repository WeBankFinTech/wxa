export default (options = {}) => {

    return (vm, type) => {

        if (['Page', 'Component'].indexOf(type) == -1) return;

        vm.wxaHijack = async function(e){
            let event = e.type;
            let eventFirstUpcase = event[0].toUpperCase() + event.substr(1);
            let beforeFn = options[`before${eventFirstUpcase}`];
            let afterFn = options[`after${eventFirstUpcase}`];
            let beforeAllFn = options[`before`];
            let afterAllFn = options[`after`];
            let originFnName = e.currentTarget.dataset[event] || e.target.dataset[event];

            if(beforeAllFn) beforeAllFn(e);
            if(beforeFn) beforeFn(e);

            if(originFnName && this[originFnName]){
                await this[originFnName](e);
            }else{
                console.log(`${originFnName}方法不存在`);
            }
            
            if(afterFn) afterFn(e);
            if(afterAllFn) afterAllFn(e);
        }
    }
}
