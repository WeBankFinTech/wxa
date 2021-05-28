/* eslint-disable one-var */
import getMyUser, {getName as getMyName} from './user';
import * as user from './user';

let a = {x: 1},
    n = 1;
let t = a;
function m(x = 1, y) {
    a = 5;
    ++a;
    t = 9;
    let qqq = 10;
}

m();

let ttt = function({x: xxx, y}) {};

let sss = (a, b) => {};

[1, 2, 3].forEach(function(item) {});

{
}
if (a) {
}

for (i = 0; i < 100; i++) {}

class myclass {}

export function mm() {}

export {m as qqqqq, a};

function name(params) {
    let t = {q: 1};
    let q = 2;
    q++;
    t.q;
}

let obj = {
    x: 1,
    t() {},
};

(function(x, y) {})();

export default {
    x: 1,
    t() {},
    m,
    age,
};
export * from './user';
// export {x, y} from './a';

/**
export default function(){}
*/
