import {classFactory} from './helpers';
import promisify from '../utils/promisify';
import {eventbus} from '../utils/eventbus';
import {router} from '../utils/router';
import wxapi from '../utils/wxapi';
import {storage} from '../utils/storage';
import {sessionStorage} from '../utils/sessionStorage';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import * as helpers from '../utils/helpers';
import fetch from '../utils/fetch';
import mixin from '../base/mixin';

// Class Decorators.
const Eventbus = classFactory('$eventbus', eventbus);
const Router = classFactory('$router', router);
const Wxapi = classFactory('$wxapi', wxapi(wx));
const Storage = classFactory('$storage', storage);
const SessionStorage = classFactory('$sessionStorage', sessionStorage);
const Utils = classFactory('$utils', {
    debounce,
    promisify,
    throttle,
    ...helpers,
});
const Fetch = classFactory('$fetch', fetch);
const Mixins = (...args)=>classFactory('mixins', [mixin({mixins: args})]);

// Page and App level class Decorators.
const Page = (classDescriptor) => {
    classDescriptor = Utils(classDescriptor);
    classDescriptor = Storage(classDescriptor);
    classDescriptor = SessionStorage(classDescriptor);
    classDescriptor = Wxapi(classDescriptor);
    classDescriptor = Router(classDescriptor);
    classDescriptor = Eventbus(classDescriptor);
    classDescriptor = Fetch(classDescriptor);

    // let {elements} = classDescriptor;

    return classDescriptor;
};

const Component = (classDescriptor) => {
    classDescriptor = Utils(classDescriptor);
    classDescriptor = Storage(classDescriptor);
    classDescriptor = SessionStorage(classDescriptor);
    classDescriptor = Wxapi(classDescriptor);
    classDescriptor = Router(classDescriptor);
    classDescriptor = Eventbus(classDescriptor);
    classDescriptor = Fetch(classDescriptor);

    return classDescriptor;
};

const App = (classDescriptor) => {
    classDescriptor = Utils(classDescriptor);
    classDescriptor = Storage(classDescriptor);
    classDescriptor = SessionStorage(classDescriptor);
    classDescriptor = Wxapi(classDescriptor);
    classDescriptor = Router(classDescriptor);
    classDescriptor = Eventbus(classDescriptor);
    classDescriptor = Fetch(classDescriptor);

    return classDescriptor;
};

export {
    Page,
    App,
    Component,
    Storage,
    SessionStorage,
    Wxapi,
    Router,
    Eventbus,
    Fetch,
    Utils,
    Mixins,
};
