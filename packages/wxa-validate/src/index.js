import * as defaultRule from './rules';
import {messages as defaultMessages} from './dictionary';
import {normalizeRules, arraySomeSync} from './utils';
import regeneratorRuntime from "regenerator-runtime/runtime";

export default (options = {}) => {
    options.enableComponentInputValidate = options.enableComponentInputValidate || false;
    options.componentClassName = ['.wxa-input-component', '.wxa-input-com'] || options.componentClassName;
    options.ignoreErrorRule = options.ignoreErrorRule || [];

    const MESSAGES = {...defaultMessages, ...options.messages};
    const VALIDATOR = {...defaultRule, ...options.rule};

    Object.keys(VALIDATOR).map(item => {
        if (!VALIDATOR[item]['getMessage']) {
            VALIDATOR[item]['getMessage'] = MESSAGES[item] ? MESSAGES[item] : MESSAGES['_default'];
        }
    })

    let generateQuery = (componentClassName) => {
        componentClassName = Array.isArray(componentClassName) ? componentClassName : [componentClassName];

        return componentClassName.map((item)=>item+' >>> .wxa-input').join(', ');
    }

    return (vm, type) => {
        if (['Page', 'Component'].indexOf(type) == -1) return;

        if (!vm.data) vm.data = {};
        vm.data.$form = {};

        vm.$$normalize = function (map) {
            return Object.keys(map).reduce((prev, key) => {
                if (typeof map[key] === 'object') {
                    return prev.concat(this.$$normalize(map[key]));
                }

                if (!~prev.indexOf(map[key]) && !~options.ignoreErrorRule.indexOf(key)) {
                    return map[key]? prev.concat(map[key]): prev;
                }
            }, [])
        }

        vm.$clearErrorMsg = function (name) {
            if (!this.data.$form || !this.data.$form.errMap || !this.data.$form.errMap[name]) return;

            delete this.data.$form.errMap[name];

            this.setData({
                '$form.errMap': this.data.$form.errMap,
                '$form.errMsgs': this.$$normalize(this.data.$form.errMap)
            })
        }

        vm.$validate = async function ({detail: {value} = {}, currentTarget: {dataset: {rule, as, name, opts = {}} = {}} = {}}) {

            if (rule == null || name == null) return console.warn('[form-wxa-plugin]需要指定data-rule和data-name');

            let $errMap = {};
            let rules = normalizeRules(rule);
            let invalid = true;

            if (value && typeof value === 'string') value = value.replace(/^\s*|\s*$/g, '');
            if (options.ignoreSpace || opts.ignoreSpace) value = value.replace(/\s/g, '');
            
            try {
                invalid = await arraySomeSync(Object.keys(rules), async (ruleName) => {
                    if (VALIDATOR[ruleName] == null) return console.warn(`${ruleName}校验规则不存在`);
                    if (!value && ruleName !== 'required') return false;

                    let generator = VALIDATOR[ruleName], 
                        _invalid = false, 
                        msg = '', targetValue;
                    if(generator.options && generator.options.hasTarget){
                        targetValue = await new Promise((resolve, reject) => {
                            let q = wx.createSelectorQuery();
                            if (type === 'Component') q.in(this);
                            q.select(rules[ruleName][0]).fields({
                                dataset: true,
                                id: true,
                                properties: ['value'],
                            }, (res) => {
                                (res == null || res.length === 0) 
                                        ? reject('没有找到目标元素') : resolve(res.value);
                            })
                            .exec();
                        });
                    }
                    let params = targetValue ? {targetValue} : rules[ruleName];
                    if (!generator.validate(value, params)){
                        msg = generator.getMessage(as || name, rules[ruleName]);
                        _invalid = true;
                    }
                    $errMap[name] = $errMap[name] || {};
                    $errMap[name][ruleName] = msg;
                    return _invalid;
                });
            } catch (e) {
                console.error(e);
            }

            this.$clearErrorMsg(name);
            let errorMap = {
                ...this.data.$form.errMap,
                ...$errMap,
            };
            // console.log('校验规则', rule, '校验值', value, '非法', invalid)
            this.setData({
                '$form.dirty': true,
                [`$form.valid.${name}`]: !invalid,
                '$form.errMap': errorMap,
                '$form.errMsgs': this.$$normalize(errorMap),
            });
            return !invalid;
        };

        vm.$type = function ({detail: {value}, currentTarget: {dataset: {name}}}) {
            value = typeof value === 'string' ? value.trim() : value;
            this.setData({[name]: value});
        };

        vm.$typeAndValidate = function (e) {
            this.$type(e);
            this.$validate(e);
        };

        vm.$validateAll = function (except = '', {enableComponentInputValidate} = {}) {
            enableComponentInputValidate = enableComponentInputValidate == null ? options.enableComponentInputValidate : enableComponentInputValidate;
            let exceptRule = Array.isArray(except) ? except : [except];
            return new Promise((resolve, reject) => {
                let q = wx.createSelectorQuery();

                if(type === 'Component') q.in(this);

                let query = '.wxa-input' + (enableComponentInputValidate ? ', '+generateQuery(options.componentClassName) : '');

                q.selectAll(query)
                    .fields({
                        dataset: true,
                        id: true,
                        properties: ['value'],
                    }, async (res) => {
                        if (res == null || res.length === 0) {
                            reject('没有找到类名为wxa-input的Input组件');
                        }
                        let tasks = [];
                        for (let {value, dataset} of res) {
                            if (~exceptRule.indexOf(dataset.name)) break;
                            tasks.push(this.$validate({currentTarget: {dataset}, detail: {value}}))
                        }
                        await Promise.all(tasks);

                        let valid = !(this.data.$form.errMsgs && this.data.$form.errMsgs.length);
                        resolve({valid, ...res});
                    })
                    .exec()
            })
        }
     
    };
};
