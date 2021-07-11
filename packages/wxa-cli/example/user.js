import {fn1 as fn11} from './user2';

export function getName() {}

export default function getAge(params) {}

// let a =1;
// export default a;

// eslint-disable-next-line one-var
export let mm1 = 1,
    c = function mm2(params) {};

function fn2(params) {}

export {fn2};
export {fn11};

export {fn2 as fn22} from './user2';
