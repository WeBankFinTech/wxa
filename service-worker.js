/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "797a290d94152b9d5aaa9a23f619223a"
  },
  {
    "url": "assets/css/0.styles.f83c3963.css",
    "revision": "53f2f6d40d71a78b1b32ab60f583eb26"
  },
  {
    "url": "assets/img/create.f01c4812.jpg",
    "revision": "f01c481220a9b13a6d47a58522575a76"
  },
  {
    "url": "assets/img/feedback.78cfac9a.png",
    "revision": "78cfac9a63b090dd8519cba2a1496b78"
  },
  {
    "url": "assets/img/preload-travel-fetch.124639cd.png",
    "revision": "124639cd9ac27fecedb5035aab987f9f"
  },
  {
    "url": "assets/img/preload-travel.f4233a6c.png",
    "revision": "f4233a6ce3c1252600c7d41d2c68af72"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/img/wechat.d557c418.png",
    "revision": "d557c418749bf61d3a0d0277ea23b8f7"
  },
  {
    "url": "assets/js/10.f6aaeb80.js",
    "revision": "2eb0706d30680b1c11597bca12b01d40"
  },
  {
    "url": "assets/js/11.54255dea.js",
    "revision": "57cc98c90990778769789f0e0e986d15"
  },
  {
    "url": "assets/js/12.9923669f.js",
    "revision": "eb19b7c32d7fee6dda513dcef6b6bb17"
  },
  {
    "url": "assets/js/13.1c3c51ba.js",
    "revision": "2ab4a04bd2be67f533c25c7763c5fea3"
  },
  {
    "url": "assets/js/14.a0833e0c.js",
    "revision": "1a63fa42b79eca6c1961a9ce2409ea6b"
  },
  {
    "url": "assets/js/15.14ca9f93.js",
    "revision": "8e014ae040b7466391bf594132dacfaa"
  },
  {
    "url": "assets/js/16.96744209.js",
    "revision": "e4bcf8097a1aefe8cc5f1f203320fb19"
  },
  {
    "url": "assets/js/17.db3f7f4a.js",
    "revision": "688c7f30cf793c058ce00ec64ae762f1"
  },
  {
    "url": "assets/js/18.3722b688.js",
    "revision": "ad1205799287c1c8929f22418be23c84"
  },
  {
    "url": "assets/js/19.9fab0459.js",
    "revision": "5655a8c31ab42b77b108f33f6acfa865"
  },
  {
    "url": "assets/js/20.627e5bd5.js",
    "revision": "14911b807dab4ebb175cac073e0f05a1"
  },
  {
    "url": "assets/js/21.a5183ffb.js",
    "revision": "6c83d4a7f9cf25b06cc0b1e97b93aab6"
  },
  {
    "url": "assets/js/22.522e44df.js",
    "revision": "5b77ebb8ca965b864c885f7e5a506f45"
  },
  {
    "url": "assets/js/23.e7e50950.js",
    "revision": "d33b3e52c534b5e98b93dec5b5b61813"
  },
  {
    "url": "assets/js/24.2b9289cb.js",
    "revision": "04b70e43a24cd17bb4be66fe322a96f8"
  },
  {
    "url": "assets/js/25.4f12003c.js",
    "revision": "3b87221371afb90579d4f5a888f54c82"
  },
  {
    "url": "assets/js/26.e8429a09.js",
    "revision": "ca70a39df8f85fc649a19fe5f1e8c346"
  },
  {
    "url": "assets/js/27.ba469541.js",
    "revision": "1f01dbf4089860c2828603a035cde79f"
  },
  {
    "url": "assets/js/28.4a04d925.js",
    "revision": "8b50ff537ec6d4d47d62c0d99b24afcc"
  },
  {
    "url": "assets/js/29.f0aa0874.js",
    "revision": "a7b0c09891dcc8dde9e9057163bdbfda"
  },
  {
    "url": "assets/js/30.ef445ed3.js",
    "revision": "020865b49e8a52d78698d34284e44a1c"
  },
  {
    "url": "assets/js/31.cc738cb9.js",
    "revision": "7fdccd16785908c839eb9d2254899961"
  },
  {
    "url": "assets/js/32.045f84a7.js",
    "revision": "6ba6549da78ccf39889ffa841ee8144e"
  },
  {
    "url": "assets/js/33.263c09fe.js",
    "revision": "d50803ce81ebe5f9948f5efea938b285"
  },
  {
    "url": "assets/js/34.e74abdf3.js",
    "revision": "f6759a97a2edcdbcd3319d64c4a66947"
  },
  {
    "url": "assets/js/35.55479d1a.js",
    "revision": "46f1bb7133cb03a03cdf85fa9d3e3134"
  },
  {
    "url": "assets/js/36.3617d1b9.js",
    "revision": "486bc3210a72fd8ea04dde6143504241"
  },
  {
    "url": "assets/js/37.be5b6f82.js",
    "revision": "ae4870fc86d6e8c5356114adb564174c"
  },
  {
    "url": "assets/js/38.035f93a0.js",
    "revision": "5b15d2d3076abad29ec9c64d2b44e091"
  },
  {
    "url": "assets/js/39.9f70789c.js",
    "revision": "4bbaf715e8f18604d38b701c8b60d854"
  },
  {
    "url": "assets/js/4.27b682a4.js",
    "revision": "764b756f1d9b1a300adc7c7e7bebfd41"
  },
  {
    "url": "assets/js/40.77dce1e4.js",
    "revision": "da05737347ed63ac53c439bc9ee158bc"
  },
  {
    "url": "assets/js/41.20b0cce6.js",
    "revision": "decefc13b7612a0a9f9c7614b8c4fca3"
  },
  {
    "url": "assets/js/42.f50982ec.js",
    "revision": "5bfbca17583bf2747e8991fe0ae775c6"
  },
  {
    "url": "assets/js/43.f0b1c738.js",
    "revision": "1b91b294bbc51a920f78e7cea7360384"
  },
  {
    "url": "assets/js/5.38cbe0cd.js",
    "revision": "0516e9bffc51b6b688766ff8fd3ff732"
  },
  {
    "url": "assets/js/6.3f6d376f.js",
    "revision": "f23ae08875b1bdf702b4390a239ae25a"
  },
  {
    "url": "assets/js/7.28cc5d92.js",
    "revision": "1bea3eceb95b397d62ae777bc006c7e2"
  },
  {
    "url": "assets/js/8.92f109f1.js",
    "revision": "c37302e9cb99694bb5e178841de249cc"
  },
  {
    "url": "assets/js/9.615a09d6.js",
    "revision": "f0f1a9a5baac30b101b2fb1bd8f6217d"
  },
  {
    "url": "assets/js/app.58e7e8f2.js",
    "revision": "d383267562b7b562bd1c728859330a22"
  },
  {
    "url": "assets/js/vendors~docsearch.0af8f36c.js",
    "revision": "e0a46b4e739ca58d138e7a754b456e6c"
  },
  {
    "url": "assets/js/vendors~notification.ccb96427.js",
    "revision": "b1f0f5223a362386cf788aeac9c85c5e"
  },
  {
    "url": "cli/command.html",
    "revision": "9a382da40edc688dc16b8c03854f8b3f"
  },
  {
    "url": "cli/configuration.html",
    "revision": "087727bbef0f91f6d7cb6ba149726eba"
  },
  {
    "url": "cli/index.html",
    "revision": "a7e3d7b64a91a80371e7210e79f7502b"
  },
  {
    "url": "core/API.html",
    "revision": "0e064c74d8a95ba0690c4584d21cdd10"
  },
  {
    "url": "core/index.html",
    "revision": "52b01c4814290f9424fadd2b2c94ec62"
  },
  {
    "url": "googled00a917fedc8f3e4.html",
    "revision": "a6e4cb349c0ccad77455d54df723947e"
  },
  {
    "url": "index.html",
    "revision": "e6afc4b53930f565681437025d940b55"
  },
  {
    "url": "learn/advance/index.html",
    "revision": "e346e4652ba3366f3a16e270702c786f"
  },
  {
    "url": "learn/advance/preload.html",
    "revision": "ce69869c2a131541188dd8c83b29fc60"
  },
  {
    "url": "learn/advance/third-party-wxa.html",
    "revision": "64cd5552aba4de91de7952cdedfc6c08"
  },
  {
    "url": "learn/advance/watch-computed.html",
    "revision": "fb52f43b3e56b7238a487f9f3763d5e4"
  },
  {
    "url": "learn/advance/wxa-directive.html",
    "revision": "5682ce64791eb637d61aedae6494fea6"
  },
  {
    "url": "learn/guide/component.html",
    "revision": "4cc613c222a06f3e73c9fe9f66d95788"
  },
  {
    "url": "learn/guide/configuration.html",
    "revision": "8cbf81a7eed3986f839e86908dbc96a6"
  },
  {
    "url": "learn/guide/construction.html",
    "revision": "ba4e595ac7e0ea4b35be14dacd7218bc"
  },
  {
    "url": "learn/guide/develop.html",
    "revision": "2ebf9c04f90063bff041e944fa9c9b32"
  },
  {
    "url": "learn/guide/editor.html",
    "revision": "451186765f0ed34a16efdebc4ef803d5"
  },
  {
    "url": "learn/guide/index.html",
    "revision": "70ffaf0a5a90953536dcdb2faf2db7e8"
  },
  {
    "url": "learn/guide/mixin.html",
    "revision": "a90948c1a5b53cd94f68274a7f2d0498"
  },
  {
    "url": "learn/guide/plugin.html",
    "revision": "099f4ea9adf262b51563aa11e33bb7a3"
  },
  {
    "url": "learn/index.html",
    "revision": "7d3ef1961b01c017ce49000708db634a"
  },
  {
    "url": "learn/other/migrade1.x.html",
    "revision": "81c92fd6348c7132cb0889ee2877f655"
  },
  {
    "url": "learn/other/migradeNative.html",
    "revision": "fcfa5d4b724661059d6a76507f46dafa"
  },
  {
    "url": "learn/quickStarted/index.html",
    "revision": "7b37ce67183898424c2660ecb0813af4"
  },
  {
    "url": "logo-mini.png",
    "revision": "3a7e9954fe49f74554a54f6c1c3558fb"
  },
  {
    "url": "plugin/cli/copy.html",
    "revision": "48a2a0408d77bb740828014ec9e791c2"
  },
  {
    "url": "plugin/cli/da.html",
    "revision": "3ffed240cbe66714e08b78a962eb6ae6"
  },
  {
    "url": "plugin/cli/hijack.html",
    "revision": "5d584d4d32d6b0631869608d24dea097"
  },
  {
    "url": "plugin/cli/minify-wxml.html",
    "revision": "c6cbf665d60305f3ba5876861792aeaf"
  },
  {
    "url": "plugin/cli/postcss.html",
    "revision": "efccbd86addba47e4b90c1de172c37c1"
  },
  {
    "url": "plugin/cli/replace.html",
    "revision": "c77522bbebc4f2b8f5987b625cc70f49"
  },
  {
    "url": "plugin/cli/uglifyjs.html",
    "revision": "bcb8fe107ea254365243e39eba8df391"
  },
  {
    "url": "plugin/core/log.html",
    "revision": "411e08638f8f8d402c6b20aafd2a9e10"
  },
  {
    "url": "plugin/core/redux.html",
    "revision": "7863c95edef4c4abe576ca8b1ea03ac3"
  },
  {
    "url": "plugin/core/validate.html",
    "revision": "ec751ce96cbb33ed08788885161e3e0c"
  },
  {
    "url": "plugin/core/watch.html",
    "revision": "7854be90b719981052f4d229e796e591"
  },
  {
    "url": "wxa-logo.png",
    "revision": "846c5bc097e185602b2ea64c0aa34061"
  },
  {
    "url": "wxajs-color.svg",
    "revision": "d3d2512a89f255a1a33fbf4e52298740"
  },
  {
    "url": "wxajs-white.png",
    "revision": "4c4c53ab09adbb5860702418215205aa"
  },
  {
    "url": "wxajs.png",
    "revision": "9f7b049f664dad1641c68266633b18dc"
  },
  {
    "url": "wxajs.svg",
    "revision": "5d9aff98926e2161e51912331fc76d6e"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
