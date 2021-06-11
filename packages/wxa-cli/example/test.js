/* eslint-disable one-var */

let obj = {x: 1},
    num1 = 1;
let num2 = 10;
let str1 = 'a';
function m() {
    num1 = 5;
    ++num2;
    let qqq = 10;
}

m();

let fn1 = function() {};

let fn2 = () => {};

[1, 2, 3].forEach(function(item) {});

for (i = 0; i < 100; i++) {}

class Myclass {
    [str1] = 1;
    [str1] = () => {};
}


m();

function name(params) {
    let t = {q: 1};
    let q = 2;
    q++;
    t.q;
}


(function(x, y) {})();

getName();
// export default {
//     x: 1,
//     t() {
//     },
//     m,
//     age,
// };
export * from './user';
export function getName() {}
// export {m as qqqqq, a as default};

// export {x, y} from './a';

export default function() {}

export {Myclass};
// eslint-disable-next-line no-var
