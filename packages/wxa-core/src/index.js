import {wxa} from './wxa';
import {default as wxapiFn} from './utils/wxapi';
import {storage} from './utils/storage';
import {sessionStorage, SessionStorage} from './utils/sessionStorage';
import {router} from './utils/router';
import promisify from './utils/promisify';
import {eventbus, Eventbus} from './utils/eventbus';
import fetch from './utils/fetch';
import * as utils from './utils/helpers';

import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import once from 'lodash/once';
import delay from 'lodash/delay';

import message from './utils/message';
import toast from './utils/toast';

import diff from './diff/diff';

export * from './decorators/index';
export const wxapi = wxapiFn(wx);
export {
    storage,
    sessionStorage, SessionStorage,
    router,
    promisify,
    eventbus, Eventbus,
    fetch,
    utils,

    debounce,
    throttle,
    once,
    delay,

    message,
    toast,

    diff,

    wxa,
};
