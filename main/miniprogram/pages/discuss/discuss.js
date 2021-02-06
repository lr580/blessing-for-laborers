// pages/discuss/discuss.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    initLoads: 5,//刚打开界面只显示五个帖子
    freshLoads: 3,//下拉刷新增添的帖子
    pathp: "cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/userpic/",//头像图片绝对路径一部分
    pathtp: "cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/postpic/",//帖子图片绝对路径一部分
    posts: [],//所有帖子（第二层下标 0为帖子对象 1用户对象 2最后活跃时间）
    postn: 0,//目前展示的帖子数
    alreadyAll: false,//已经读完了全部帖子
    me:0,//当前用户uid
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({me:getApp().globalData.userID})
    wx.cloud.database().collection('post').where({
      type: wx.cloud.database().command.neq(0),
      hide: false,
    }).limit(this.data.initLoads)
      .orderBy('activeTime', 'desc').get().then(res => {
        var fina = 0
        var temp = []//读取数据暂存
        for (let i = 0; i < res.data.length; ++i) temp[i] = []

        for (let i = 0; i < res.data.length; ++i) {
          temp[i][0] = res.data[i]
          temp[i][2] = [res.data[i].activeTime.getFullYear(),
          res.data[i].activeTime.getMonth() + 1,
          res.data[i].activeTime.getDate(),
          res.data[i].activeTime.getHours(),
          res.data[i].activeTime.getMinutes(),
          res.data[i].activeTime.getSeconds()]
          wx.cloud.database().collection('user').doc(String(res.data[i].user)).get().then(ret => {
            ++fina
            temp[i][1] = ret.data
            if (fina == res.data.length) {
              this.setData({
                postn: res.data.length,
                posts: temp,
              })
            }
          })
        }
      })

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var lastLeastActiveTime = this.data.posts[this.data.posts.length - 1][0].activeTime
    var olen = this.data.posts.length //原本加载了多少帖子
    wx.cloud.database().collection('post').where({
      type: wx.cloud.database().command.neq(0),
      activeTime: wx.cloud.database().command.lt(lastLeastActiveTime),//就现实情况而言，不存在两个帖子同时发布
      hide: false,//修复了BUGS
    }).limit(this.data.freshLoads)
      .orderBy('activeTime', 'desc').get().then(res => {
        var fina = 0
        var temp = []//读取数据暂存
        if(!res.data.length) this.setData({alreadyAll:true})

        for (let i = 0; i < res.data.length; ++i) temp[i] = []

        for (let i = 0; i < res.data.length; ++i) {
          temp[i][0] = res.data[i]
          temp[i][2] = [res.data[i].activeTime.getFullYear(),
          res.data[i].activeTime.getMonth() + 1,
          res.data[i].activeTime.getDate(),
          res.data[i].activeTime.getHours(),
          res.data[i].activeTime.getMinutes(),
          res.data[i].activeTime.getSeconds()]
          wx.cloud.database().collection('user').doc(String(res.data[i].user)).get().then(ret => {
            ++fina
            temp[i][1] = ret.data
            if (fina == res.data.length) {
              this.setData({
                postn: this.data.postn+res.data.length,
                posts: this.data.posts.concat(temp),
              })
            }
          })
        }
      })
  },


  /**
   * 页面相关事件处理函数--监听用户上拉！动作
   */
  onPullDownRefresh: function () {
    this.onLoad()
    this.setData({alreadyAll:false})
    wx.showToast({
      title: '刷新成功',
      duration: 1500,
    })
  },

  gotoPost:function(e){
    wx.navigateTo({
      url: '/pages/postt/postt?id='+String(e.currentTarget.id),
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})