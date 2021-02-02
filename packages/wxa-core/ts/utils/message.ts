import wxapi from './wxapi';
import {IWXAPromiseAPI} from './wxapi';

class Message {
    public wxapi: IWXAPromiseAPI;
    public config: any;

    constructor(wxapi: IWXAPromiseAPI) {
        this.wxapi = wxapi;
        this.config = {
            title: '',
            showCancel: false,
            confirmColor: '#09bb07',
        };
    }

    show(title: string, content='', btn={}) {
        return this.wxapi.showModal({
            ...this.config,
            title,
            content,
            ...btn,
        });
    }

    error(title: string, content: string, btn: Record<string, unknown>) {
        return this.show(title, content, btn);
    }
}

const _message = new Message(wxapi(wx));
const message = (title, content, opt)=>{
    return _message.show(title, content, opt);
};
Object.getOwnPropertyNames(Message.prototype).forEach((key)=>{
    const descriptor = Object.getOwnPropertyDescriptor(Message.prototype, key);
    if (descriptor.writable) message[key] = _message[key].bind(_message);
});

export {
    message as default,
    Message,
};
