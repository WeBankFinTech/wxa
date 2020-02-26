import mock from './mock/index';
// import anotherDirective from './anotherDirective';
// ...

// 指令区块变量名建议：
//   wxa:drcName     =  "drcFn(...drcParam)"
// |- drcFullName -|    |----- drcVal -----|

export default directive;

const directiveHandlerList = {
    mock,
    // anotherDirective
    // ...
};

function directive(drc, element, mdl) {
    let drcName = drc.name;
    if (drcName && directiveHandlerList[drcName]) {
        directiveHandlerList[drcName](drc, element, mdl);
    }
}
