/* eslint-disable one-var */
import getMyUser, {getName as getMyName} from './user';
import * as user from './user';


console.log(user);
let a = {x: 1},
    n = 1;
let t = 10;
function m(x = 1, y) {
    a = 5;
    ++a;
    t = 9;
    t+5;
    let qqq = 10;
}
m();

let ttt = function({x: xxx, y}) {};

let sss = (a, b) => {};

[1, 2, 3].forEach(function(item) {});

{
}


for (i = 0; i < 100; i++) {}

class Myclass {
    [n]=1;
    [n]=()=>{

    }
}

export function mm() {}

mm();


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


getName();
// export default {
//     x: 1,
//     t() {
//     },
//     m,
//     age,
// };
export * from './user';
export function getName() {
    
}
// export {m as qqqqq, a as default};

// export {x, y} from './a';

export default function() {}

export {Myclass};
// eslint-disable-next-line no-var

export {
    mm as ttttttt,
};

export {getName as tttt} from './user';


export * as tttttt from 'user';


