/**
 * form plugin for wxa.js
 * 
 * <input class="" wxa-validate type="text" data-rule="required" data-as="" data-name="x.y" data-scope="scope">
 * 
 * <button disabled="{{$errorBag.scope.valid x.y}}"></button>
 * 
 * <bankcard > 
 * 
 */
import * as Rules from './rules/index'

class Validator {
    
    constructor() {
        this.defaultOptions = {
            locale: 'en',
            dictionary: null
        }
        this.options = Object.assign({}, this.defaultOptions, Validator.options);
    }

    static set(name, options) {
        this[name] = options;
    }

    static findName(name) {
        // return name.
    }

    validate(name, value, rule) {
        let validator = Rules[rule];

    }

    // findName()
}

export default (options)=>{
    console.log('===')
    Validator.set('options', options);

    return (vm, type)=>{
        if(~['Page', 'Component'].indexOf(type)) {

            vm.$validator = new Validator()
            vm.$validate = function(e) {
                let {currentTarget: {dataset: {name, as, rule, scope}}, detail: {value=''}} = e;

                if(name == null) {
                    console.warn('you must setup data-name for wxa-validator');
                    return ;
                }

                value = value.replace(/^\s*|\s*$/g, '');
                this.setData({  
                    [name]: value
                });
                this.$validator.validate(name, value, rule);
            }
            vm.$validator.validate;
        }
    };
};
