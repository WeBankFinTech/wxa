/* eslint-disable one-var */
import './user';
import * as user from './user';
import {writeFile, isFile} from './cjs1';
writeFile();
isFile();
console.log(user);
let a = {
  x: 1,
},
    n = 1;
let t = 10;

function m(x = 1, y) {
  a = 5;
  ++a;
  t = 9;
  t + 5;
}

m();
[1, 2, 3].forEach(function(item) {});

for (i = 0; i < 100; i++) {}

class Myclass {
  [n] = 1;
  [n] = () => {};
}

export function mm() {}
mm();

(function(x, y) {})(); // export default {
//     x: 1,
//     t() {
//     },
//     m,
//     age,
// };


export function getName() {} // export {m as qqqqq, a as default};
// export {x, y} from './a';

export default function() {}
export {Myclass}; // eslint-disable-next-line no-var

export {mm as ttttttt};
export {getName as tttt} from './user';
export * as tttttt from './user';
