import app from './base/app';
import page from './base/page';
import component from './base/component';
import wxapi from './utils/wxapi';
import {storage} from './utils/storage';
import {router} from './utils/router';
import promisify from './utils/promisify';
import {eventbus} from './utils/eventbus';


// define some convenient api for user.
class Wxa {
    constructor() {
        this.use.app = app.use;
        this.use.page = page.use;
        this.use.component = component.use;
    }
    launch = {
        app(instance) {
            return app.launch(instance);
        },
        page(instance) {
            return page.launch(instance);
        },
        component(instance) {
            return component.launch(instance);
        },
    }
    launchApp(instance) {
        return app.launch(instance);
    }
    launchPage(instance) {
        return page.launch(instance);
    }
    launchComponent(instance) {
        return component.launch(instance);
    }
    use(plugin, options) {
        app.use(plugin, options);
        page.use(plugin, options);
        component.use(plugin, options);
    }
}

export const wxa = new Wxa();
export * from './utils/decorators';
export {
    wxapi,
    storage,
    router,
    promisify,
    eventbus,
};
