

export {default} from './a';


/* eslint-disable one-var */
// 具名导出
export {a as aa, b, c} from '';
export * as all from '';
export function fn1() {}
let o1 = 1, o2=3;
export {o1 as o11, o2};

// 默认导出
// export {default} from ''
// export {a as default} from ''
// export * as default from ''
// export default function() {}
// export default {}
// export  {a as default}
// let p1 = 1
// export default p1

// 导出全部
export * from '';
