exports.InjectCompileTimePlugin = class InjectCompileTimePlugin {
    constructor(comps = []) {
      this.comps = comps;
    }
    apply(compiler) {
      if (compiler.hooks == null || compiler.hooks.buildModule == null) return;
  
      compiler.hooks.buildModule.tap("global-component-inject", (mdl) => {
        console.log(mdl);
        if (!["App", "Page"].includes(mdl.category)) {
          return;
        }
        if (mdl.category === "App" && mdl.type === "json") {
          const config = JSON.parse(mdl.content);
          if (!config.usingComponents) {
            config.usingComponents = {};
          }
          this.comps.forEach(({ path, name }) => {
            config.usingComponents[`wxa_inject_${name}`] = path;
          });
          config.usingComponents.wxa_inject_wrapper =
            "../node_modules/@wxa/plugin-global-component-inject/wrapper";
          mdl.content = JSON.stringify(config, null, 4);
        }
        if (mdl.category === "Page" && mdl.type === "wxml") {
          let topBuf = "";
          this.comps.forEach(({ name, position }) => {
            topBuf += `<wxa_inject_${name} id="__WXA_INJECTED_${name}"/>`;
          });
          mdl.content = `<wxa_inject_wrapper>${topBuf}</wxa_inject_wrapper>${mdl.content}`;
        }
        // if (mdl.type== 'json'){
        //     const config = JSON.parse(mdl.content);
        //     config.usingComponents.
        // }
        // if (
        //     mdl.meta &&
        //     this.configs.test.test(mdl.meta.source)
        // ) {
        //     debug('Plugin replace started %O', mdl.src)
        //     this.run(mdl);
        // }
      });
    }
  };