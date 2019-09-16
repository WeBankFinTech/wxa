import wxapi from './wxapi';

class Toast {
    constructor(wxapi) {
        this.wxapi = wxapi;
        this.defaultOpt = {
            icon: 'none',
            mask: true,
        };
    }

    show(title, opt) {
        return this.wxapi.showToast({
            ...this.defaultOpt,
            title,
            ...opt,
        });
    }

    success(title, opt) {
        return this.show(title, {icon: 'success', ...opt});
    }

    loading(title, opt) {
        return this.show(title, {icon: 'loading', ...opt});
    }
}

const _toast = new Toast(wxapi(wx));
const toast = (title, opt)=>{
    return _toast.show(title, opt);
};
Object.getOwnPropertyNames(Toast.prototype).forEach((key)=>{
    toast[key] = _toast[key].bind(_toast);
});

export {
    toast as default,
    Toast,
};
