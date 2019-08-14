let $$testSuitePlugin = function() {
    return function(vm, type) {
        console.log('test suite');

        vm.$$call = function(e) {
            console.log(e.currentTarget.dataset.$$testClass);
        };
    };
};
