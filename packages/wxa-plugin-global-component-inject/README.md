:blush::blush::blush::blush:[Documentation](https://genuifx.github.io/wxa/cli/replace.html)

# wxa-plugin-replace

[![NPM version](https://img.shields.io/npm/v/@wxa/plugin-replace.svg)](https://www.npmjs.com/package/@wxa/plugin-replace)

:tada:向所有页面注入组件

## Usage

###

```javascript
//wxa.config.js
const {
  InjectCompileTimePlugin,
} = require("@wxa/plugin-global-component-inject/compile");
new InjectCompileTimePlugin([
  { path: "/components/comp.wxa", name: "injectComp" },
]);

//app.wxa
import { runtimePlugin } from "@wxa/plugin-global-component-inject";
wxa.use(runtimePlugin);
```

```javascript
// when you have *this* of Component or Page
this.getInjectedComponent("injectComp");
this.invokeInjectedComponent("injectComp", "args1", "args2");
// or
import { helpers } from "@wxa/plugin-global-component-inject";
helpers.get("injectComp");
helpers.invoke("injectComp", null, "args");
```
