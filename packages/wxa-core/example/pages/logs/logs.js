import {Page, wxa} from '../../dist/wxa.js';
// logs.js
const util = require('../../utils/util.js');

let i = Page(class Logs {
  data = {
    logs: [],
  }
  onLoad() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map((log) => {
        return util.formatTime(new Date(log));
      }),
    });
  }
});

wxa.launchPage(i);
