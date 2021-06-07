/* eslint-disable one-var */
import './user';
import * as user from './user';
console.log(user);
let a = {
  x: 1,
};
let t = a;

function m(x = 1, y) {
  // eslint-disable-next-line no-tabs
  a = 5;
  ++a;
  t = 9;
}

m();
[1, 2, 3].forEach(function(item) {});
{}


for (i = 0; i < 100; i++) {}

export function mm() {}
mm();

(function(x, y) {})();

getName(); // export default {
//     x: 1,
//     t() {
//     },
//     m,
//     age,
// };

export function getName() {} // export {m as qqqqq, a as default};
// export {x, y} from './a';

export {}; // eslint-disable-next-line no-var

export {};
export {} from './user';
export {} from 'user';
