//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        env: 'scnuyjx-7gmvlqwfe64c446a',
        traceUser: true,
      })
    }
    if(false) //暂时不需要用到的时候先不读，减少云开发次数消耗
    wx.cloud.database().collection('global').doc('default').get().then(res=>{
      this.globalData.maxuid=res.data.maxuid
      this.globalData.maxpid=res.data.maxpid
    })
    this.globalData = {
      pathp: "cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/userpic/",//头像图片绝对路径一部分
      pathtp: "cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/postpic/",//帖子图片绝对路径一部分
      userID:1,//调试状态默认
      maxuid:0,
      maxpid:0,
    }


  }
})
