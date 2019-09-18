import deepMergeJs from '../utils/deep-merge';

import { hooksName, IHooks, IHooksArray } from './hook';

export interface IWXAOBJ extends IHooks {
  [key: string]: any;
  methods ?: object;
  data ?: object;
  mixins ?: IWXAVM[];
}

interface IWXAClass extends IWXAOBJ {
  new (...params: any[]): any;
}

type IWXAVM = IWXAClass | IWXAOBJ;

interface ICandidate {
  methods?: object;
  data?: object;
  hooks?: IHooksArray;
}

const getPropotypeOf = Object.getPrototypeOf || (obj => obj.__proto__);

// trace prototype to copy method for extends.
const tracePrototypeMethods = (prof: object): object => {
  const result: object = {};

  Object.getOwnPropertyNames(prof).forEach((key) => {
        // wxa private methods that prefix with $ should allways not to copy.
        // also, the wxa hooks, un-writable methos and mixins shouldn't too.
    if (
        !~['constructor', 'mixins'].indexOf(key) &&
        !/^$/.test(key) &&
        hooksName.indexOf(key) === -1
    ) {
      (result as any)[key] = (prof as any)[key];
    }
  });

  const proto = getPropotypeOf(prof);

  if (proto && proto.constructor !== Object) {
    return {
      ...tracePrototypeMethods(proto),
      ...result,
    };
  }

  return result;
};

const copyMethodsFromClass = (vm: IWXAVM): IWXAVM => {
  let obj: IWXAVM = vm;

  if (typeof vm === 'function') {
    obj = new vm();

    obj.methods = obj.methods || {};

    const tracedMethods = tracePrototypeMethods(vm.prototype);

    obj.methods = {
      ...obj.methods,
      ...tracedMethods,
    };
  } else if (typeof vm !== 'object') {
    obj = {};
  }

  return obj;
};

export default function mixin(vm: IWXAVM, globalMixin: IWXAVM[]= []): IWXAOBJ {
  let instance: IWXAOBJ = {};

  if (vm == null) return instance;

  instance = copyMethodsFromClass(vm);

  if (typeof instance !== 'object') return {};

    // mixins object is allow to put on prototype object. so here may not delete it.
  let mixins = instance.mixins || [];
  delete instance.mixins;

  mixins = mixins.concat(globalMixin);
  mixins.push(instance);
  // nested mixins copy
  mixins = mixins.map((item) => {
    // never call handle vm again, or may cost endless loop
    if (item == null || item === vm) return item;

    if (item.mixins) return mixin(item);

    return copyMethodsFromClass(item);
  });
  // copy methods, data and hooks;

  const candidate: ICandidate = mixins.reduce((ret: ICandidate, mixinItem) => {
    if (mixinItem == null || typeof mixinItem !== 'object') {
      return ret;
    }

    /**
     * copy object's methods
     */
    if (mixinItem.methods) {
      Object.keys(mixinItem.methods).forEach((key) => {
        (ret.methods as any)[key] = (mixinItem.methods as any)[key];
      });
    }
    /**
     * copy data
     */
    if (typeof mixinItem.data === 'object' && mixinItem.data != null) {
      ret.data = deepMergeJs(ret.data, mixinItem.data);
    }
    /**
     * copy lifecycle hooks
     * ~~do not copy onShareAppMessage~~
     * try to merge onShareAppMessage function.
     */
    hooksName.forEach((name) => {
      if (!(mixinItem as any)[name]) return;

      if (Array.isArray((ret.hooks as any)[name])) {
        (ret.hooks as any)[name].push((mixinItem as any)[name]);
      } else {
        (ret.hooks as any)[name] = [(mixinItem as any)[name]];
      }
    });

    return ret;
  }, {
    data: {},
    hooks: {},
    methods: {},
  });

  instance.data = candidate.data;
  instance.methods = candidate.methods;
  Object.keys(candidate.hooks!).forEach((name: (keyof IHooksArray)) => {
    // console.log(name);
    if (name === 'onShareAppMessage') {
      instance.onShareAppMessage = function (...opts) {
        const self = this;

        let ret;
        candidate.hooks!.onShareAppMessage!.forEach((fn) => {
          ret = fn.apply(self, opts);
        });
        // onShareAppMessage according to return value to custorm share message.
        return ret;
      };
    } else {
      instance[name] = function (...opts: any[]) {
        const self = this;
        candidate.hooks![name]!.forEach((fn) => {
          fn.apply(self, opts);
        });
      };
    }
  });

  return instance;
}
