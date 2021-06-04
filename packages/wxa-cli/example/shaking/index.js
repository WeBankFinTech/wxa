/* eslint-disable one-var */
import './user';
import './user';
let a = {
  x: 1
};
let t = a;

function m(x = 1, y) {
  a.x;
  a = 5;
  ++a;
  t = 9;
}

m();
[1, 2, 3].forEach(function (item) {});
{}

if (a) {}

for (i = 0; i < 100; i++) {}

export function mm() {}

(function (x, y) {})(); // export default {
//     x: 1,
//     t() {},
//     m,
//     age,
// };


export * from './user';
export function getName() {}
export { m as qqqqq, a as default }; // export {x, y} from './a';

/**
export default function(){}
*/