import path from 'path';
export default {
    src: __dirname+path.sep+'ROOT',
    kind: 'root',
    isAbstract: true,
    isROOT: true,
    childNodes: new Map(),
    package: '', // 主包
};
