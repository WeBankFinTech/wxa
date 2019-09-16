type anyFn = () => any;

export const hooksName = [
  'onLaunch',
  'onHide',
  'onError',
  'onLoad',
  'onReady',
  'onShow',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom',
  'onPageScroll',
  'onTabItemTap',
  'onPageNotFound',
  'onShareAppMessage',
  'beforeRouteEnter',
];

export interface IHooks {
  onLaunch ?: anyFn;
  onHide ?: anyFn;
  onError ?: anyFn;
  onLoad ?: anyFn;
  onReady ?: anyFn;
  onShow ?: anyFn;
  onUnload ?: anyFn;
  onPullDownRefresh ?: anyFn;
  onReachBottom ?: anyFn;
  onPageScroll ?: anyFn;
  onTabItemTap ?: anyFn;
  onPageNotFound ?: anyFn;
  onShareAppMessage ?: anyFn;
  beforeRouteEnter ?: anyFn;
}

export interface IHooksArray {
  onLaunch ?: anyFn[];
  onHide ?: anyFn[];
  onError ?: anyFn[];
  onLoad ?: anyFn[];
  onReady ?: anyFn[];
  onShow ?: anyFn[];
  onUnload ?: anyFn[];
  onPullDownRefresh ?: anyFn[];
  onReachBottom ?: anyFn[];
  onPageScroll ?: anyFn[];
  onTabItemTap ?: anyFn[];
  onPageNotFound ?: anyFn[];
  onShareAppMessage ?: anyFn[];
  beforeRouteEnter ?: anyFn[];
}
