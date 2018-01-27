import app from './base/app';
import page from './base/page';

// define some convenient api for user.
class Wxa {
    constructor() {
        this.use.app = app.use;
        this.use.page = page.use;
    }
    launch = {
        app(instance) {
            return app.launch(instance);
        },
        page(instance) {
            return page.launch(instance);
        },
    }
    launchApp(instance) {
        return app.launch(instance);
    }
    launchPage(instance) {
        return page.launch(instance);
    }
    use(plugin, options) {
        app.use(plugin, options);
        page.use(plugin, options);
    }
}

export const wxa = new Wxa();
export * from './utils/decorators';
