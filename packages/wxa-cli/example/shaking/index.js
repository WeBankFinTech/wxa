/* eslint-disable one-var */
import './user';
import * as user from './user';
import './user';
import {writeFile, isFile} from './cjs1';
writeFile();
isFile();
getName();
console.log(user);
let a = {
  x: 1,
},
    n = 1;
let t = 10;

function m() {
  a = 5;
  ++a;
  t = 9;
  t + 5;
  let ssqqww = 5;
  console.log(ssqqww);
}

m();
[1, 2, 3].forEach(function() {});

for (i = 0; i < 100; i++) {}

class Myclass {
  [n] = 1;
  [n] = () => {};
}

function mm() {}

export {mm};
mm();

(function() {})(); // export default {
//     x: 1,
//     t() {
//     },
//     m,
//     age,
// };


let qwe = 1,
    rty = 2;
export {qwe, rty};

function getName() {}

export {getName};
// export {m as qqqqq, a as default};
// export {x, y} from './a';
// export default function asf() {};
export {Myclass}; // eslint-disable-next-line no-var

export {mm as ttttttt};
export {getName as tttt} from './user';
export {default} from './user';
export * as tttttt from './user';
