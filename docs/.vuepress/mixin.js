const notification = {
    '/': `
    <div>
      <div>请注意这是 <b>2.x</b> 的文档，由于目前 2.x 处于 <b>rc</b> 阶段，核心功能和 API 已经稳定，不会有大的 Break Change 出现，欢迎使用。
      <br>
      <ul>
        <li>1.x 的文档: <a style="color: #fff;" href="https://genuifx.com/wxa/v0/"><code>genuifx.com/wxa/v0/</code></a>
        </li>
        <li>安装 1.x: <code>npm install @wxa/cli</code></li>
        <li>安装 2.x rc: <code>npm install @wxa/cli2@next</code></li>
      </ul>
    </div>
  `
  }
  
  const gotIt = {
    '/': '知道了'
  }
  
  export default {
    methods: {
      notice () {
        setTimeout(() => {
          this.$notification = this.$toasted.show(notification[this.$localePath], {
            containerClass: 'compatibility-notification',
            closeOnSwipe: false,
            // you can pass a single action as below
            action: {
              text: gotIt[this.$localePath],
              onClick: (e, toastObject) => {
                toastObject.goAway(0)
              }
            }
          })
        }, 500)
      }
    },
    watch: {
      '$page' () {
        this.$notification && this.$notification.goAway(0)
      },
      '$localePath' () {
        this.$notification && this.$notification.goAway(0)
        this.notice()
      }
    },
    mounted () {
      this.notice()
    }
  }