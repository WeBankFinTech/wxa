import wxapi, {IWXAPromiseAPI} from './wxapi';

class Toast {
    public wxapi: IWXAPromiseAPI;
    public defaultOpt: any;

    constructor(wxapi: IWXAPromiseAPI) {
        this.wxapi = wxapi;
        this.defaultOpt = {
            icon: 'none',
            mask: true,
        };
    }

    show(title: string, opt: any) {
        return this.wxapi.showToast({
            ...this.defaultOpt,
            title,
            ...opt,
        });
    }

    success(title: string, opt: any) {
        return this.show(title, {icon: 'success', ...opt});
    }

    loading(title: string, opt: any) {
        return this.show(title, {icon: 'loading', ...opt});
    }
}

const _toast = new Toast(wxapi(wx));
const toast = (title: string, opt: any)=>{
    return _toast.show(title, opt);
};
Object.getOwnPropertyNames(Toast.prototype).forEach((key)=>{
    const descriptor = Object.getOwnPropertyDescriptor(Toast.prototype, key);
    if (descriptor.writable) toast[key] = _toast[key].bind(_toast);
});

export {
    toast as default,
    Toast,
};
