/* eslint-disable one-var */
import getAge from './user';
import './user';
import './user';
import { writeFile, isFile } from './cjs1';
writeFile();
isFile();
getName();
// console.log(user);
console.log(getAge);
let a = {
  x: 1
},
    n = 1;
let t = 10;

function m(x = 1, y) {
  a = 5;
  ++a;
  t = 9;
  t + 5;
  let ssqqww = 5;
  console.log(ssqqww);
}

m();

try {
  let a = 1;
  console.log(a);
} catch (error) {}

[1, 2, 3].forEach(function (item) {});

for (i = 0; i < 100; i++) {}

class Myclass {
  [n] = 1;
  [n] = () => {};
}

let [zz, xx, cc] = [1, 2, 3];
let {
  x: x1
} = {
  x: 1,
  y2: 2
};
let {
  detail: {
    code,
    code1
  }
} = {
  detail: {
    code: 1
  }
};
let o22 = 1;
let o11 = o22 = 3;
console.log(o22);

let clearErrorMsg = function ({
  p1,
  p2
}, {
  currentTarget: {
    dataset: {
      rule,
      as,
      name,
      opts = {}
    }
  }
}, [asq, ttqw], ppp) {};

function aaa({
  p1,
  p2
}) {}

;
aaa();
clearErrorMsg();
mm();
let obj = {
  x: 1,

  t() {}

};

(function (x, y) {})(); // export default {
//     x: 1,
//     t() {
//     },
//     m,
//     age,
// };


let qwe = 1,
    rty = 2;
export { qwe, rty };

function getName() {}

export { getName };

function mm() {}

export { mm };

class asf {}

// export {m as qqqqq, a as default};
// export {x, y} from './a';
export default asf;
;
export { Myclass }; // eslint-disable-next-line no-var

export { mm as ttttttt }; // export {getName as tttt} from './user';
// export {default} from './user';
// export * as tttttt from './user';