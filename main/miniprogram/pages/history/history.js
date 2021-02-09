// pages/history/history.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    me: 1,//当前用户uid
    unfresh: false,//未刷新
    posts: [],//浏览的帖子
    dates: [],//对应浏览的日期
    types: [],//帖子类型常量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      me: getApp().globalData.userID,
      unfresh: false,
      loading: true,
      tags: getApp().globalData.types,
    })
    const db = wx.cloud.database()
    function cmp() {//时间降序排序
      return function (a, b) {
        return b[1]['$date'] - a[1]['$date']
      }
    }
    db.collection('user').doc(String(this.data.me)).get().then(res => {
      var log = res.data.browseLog
      var p = []
      var d = []
      log.sort(cmp())
      var fin = 0
      var tg = log.length
      for (let i = 0; i < tg; ++i) {
        d[i] = log[i][1]
        console.log(log)
        log[i][1]=new Date(log[i][1]['$date'])
        d[i] = [log[i][1].getFullYear(),
        log[i][1].getMonth() + 1,
        log[i][1].getDate(),
        log[i][1].getHours(),
        log[i][1].getMinutes(),
        log[i][1].getSeconds()]
        db.collection('post').doc(String(log[i][0])).get().then(ret => {
          p[i] = ret.data
          ++fin
          if (fin == tg) {
            this.setData({
              posts: p,
              dates: d,
              loading: false,
            })
          }
        })
      }
    })
  },

  gotoPost: function (e) {
    var temp = this.data.posts
    var idx = -1
    for (let i = 0; i < this.data.postn; ++i) {
      if (Number(e.currentTarget.id) == temp[i][0].id) {
        idx = i
        break
      }
    }
    //console.log(temp[idx][0].type,temp[idx][0].fatherPost)
    if (temp[idx][0].fatherPost) {//原理上恒为true
      wx.navigateTo({
        url: '/pages/postt/postt?id=' + String(temp[idx][0].fatherPost),
      })
    } else {
      wx.navigateTo({
        url: '/pages/postt/postt?id=' + String(e.currentTarget.id),
      })
    }
    this.setData({ unfresh: true })
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})