const wrappers = new Map();
function getPage(inst) {
  if (!inst) {
    const pages = getCurrentPages();
    return wrappers.get(pages[pages.length - 1].getPageId());
  }
  console.log("getpage", inst);
  let tmp;
  while ((tmp = inst.selectOwnerComponent())) {
    console.log("getpage looking", inst);
    inst = tmp;
  }
  return inst;
}
function get(name, inst) {
  const pages = getCurrentPages();
  console.log('pages',pages)
  console.log(
    "inst",
    wrappers,
    wrappers.get(pages[pages.length - 1].getPageId())
  );
  return getPage(inst).selectComponent(`#__WXA_INJECTED_${name}`);
}
exports.helpers = {
  get,
  invoke(name, inst, ...args) {
    get(name, inst).invoke(...args);
  },
};
exports.runtimePlugin = () => {
  return (vm, type) => {
    if (!["Page", "Component"].includes(type)) {
      return;
    }
    vm.getInjectedComponent = function(name) {
      console.log(this);
      return get(name, this);
    };
    vm.invokeInjectedComponent = function(name, ...args) {
      console.log(this);
      return get(name, this).invoke(...args);
    };
  };
};
exports.WRAPPER_INSTANCES = wrappers;
