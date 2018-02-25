const DOMParser = require('xmldom').DOMParser;

let str = `
    <view class="{{a&&b}}">&amp;lt;青稞奶茶&gt;</view>
`;

let parser = new DOMParser();
let ret = parser.parseFromString(str);

console.log(ret);
