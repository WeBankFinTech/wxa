import {wxa} from "@wxa/core";

interface IComponentInstance {
    _$state?: object;
    _$effect?: object;
    _$setup?: () => {};
    _$callbacks?: object;
}

let currentComInstance: IComponentInstance = null;
let callIndex: number = 0;

const checkInstance = () => {
    // tslint:disable-next-line: curly
    if (!currentComInstance) throw new Error("Component instance not found");
};

interface IComponentStateAndMethod {
    data?: object;
    methods?: object;
    [propName: string]: any;
}

interface IComponentOptions {
    properties?: object;
    options?: object;
    observers?: object;
    pageLifetimes?: object;
    lifetimes?: object;
    behaviors?: object;
    externalClasses?: string[];
    relations?: object;
    [propName: string]: any;
}

function withHooks(setup: (props: object) => IComponentStateAndMethod, options: IComponentOptions) {
    // tslint:disable-next-line: no-empty
    setup = typeof setup === "function" ? setup : () => ({});

    return wxa.launchComponent({
        ...options,
        created() {
            this._$state = {};
            this._$effect = {};
            this._$callbacks = {};

            this._$setup = () => {
                currentComInstance = this;
                callIndex = 0;
                const {data, methods} = setup.call(null, this.data) || {};
                currentComInstance = null;

                Object.keys(methods).forEach((key) => {
                    this[key] = methods[key];
                });
                this.$diff(data);
            };
        },
        attached() {
            this._$setup();
        },
        detached() {
            Object.keys(this._$effect).forEach((key) => {
                const effect = this._$effect[key];
                const destroy = effect.destroy;

                // tslint:disable-next-line: curly
                if (typeof destroy === "function") destroy.call(null);
            });
            this._$state = null;
            this._$effect = null;
            this._$setup = null;
            this._$callbacks = null;
        },
    });
}

function useState(initialState: any) {
    checkInstance();

    const index = callIndex++;
    const instance = currentComInstance;

    // initialState;
    if (instance._$state[index] === void(0)) {
        instance._$state[index] = initialState;
    }

    // tslint:disable-next-line: only-arrow-functions
    const setState = function(value) {
        instance._$state[index] = value;
        instance._$setup();
    };

    return [instance._$state[index], setState];
}

function useEffect(effectFn: () => {}, deps: any[]) {
    checkInstance();

    const index = callIndex++;
    const instance = currentComInstance;
    const effect = instance._$effect[index];

    const tryCleanupAndUseEffect = () => {
        // 总是清除上一次的 effecct
        if (typeof effect.destroy === "function") {
            effect.destroy();
        }
        // 接着调用下一次的 effect;
        effect.destroy = effectFn.call(null);
        effect.lastDeps = deps === void(0) ? void(0) : [...deps];
    };

    if (effect === void(0)) {
        instance._$effect[index] = {
            // attached 第一次渲染
            destroy: effectFn.call(null),
            // 浅拷贝一份，方便后续比较时候使用
            lastDeps: deps === void(0) ? void(0) : [...deps],
        };
    } else if (!effect.lastDeps && !deps) {
        tryCleanupAndUseEffect();
    } else {
        for (let i = 0, len = deps.length; i < len; i++) {
            if (effect.lastDeps[i] !== deps[i]) {
                // 依赖发生变化
                tryCleanupAndUseEffect();
                break;
            }
        }
    }
}

// function useCallback(callbackFn: () => {}, deps: []) {
//     checkInstance();

//     const index = callIndex++;
//     const instance = currentComInstance;
//     const callback = instance._$callbacks[index];

//     if (callback === void(0)) {
//         instance._$callbacks[index] = {
//             callback: callbackFn,
//             lastDeps: deps === void(0) ? void(0) : [...deps]
//         };
//     } 
// }

export {
    withHooks,
    useState,
    useEffect,
};
