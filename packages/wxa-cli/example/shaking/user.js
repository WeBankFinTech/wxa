function getName() {}

export {getName};
// export default function getUser(params) {
// }
let a = 1;
export default a; // eslint-disable-next-line one-var

let mm1 = 1,
    c = function mm2() {};

export {mm1, c};

function fn2() {}

export {fn2};
