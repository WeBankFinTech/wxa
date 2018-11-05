import {default as wxapiFn} from './utils/wxapi';
import {storage} from './utils/storage';
import {router} from './utils/router';
import promisify from './utils/promisify';
import {eventbus} from './utils/eventbus';

import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import once from 'lodash/once';
import delay from 'lodash/delay';

import message from './utils/message';
import toast from './utils/toast';

import diff from './diff/diff';

export * from './wxa';
export * from './decorators/index';
export const wxapi = wxapiFn(wx);
export {
    storage,
    router,
    promisify,
    eventbus,
    fetch,

    debounce,
    throttle,
    once,
    delay,

    message,
    toast,

    diff,
};
