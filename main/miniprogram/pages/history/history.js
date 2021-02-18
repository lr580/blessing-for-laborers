// pages/history/history.js
const modu = require('../../lrfx.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    me: 1,//当前用户uid
    unfresh: false,//未刷新
    posts: [],//浏览的帖子对象
    dates: [],//对应浏览的日期(拆分数组)
    types: [],//帖子类型常量
    users: [],//发帖人对象
    loading: false,//是否在加载
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //页面必须关闭后打开才刷新，否则需要做太多if判断
    this.setData({
      me: getApp().globalData.userID,
      unfresh: false,
      loading: true,
      types: [''].concat(getApp().globalData.types),
    })
    const db = wx.cloud.database()
    const _ = db.command
    function cmp() {//时间降序排序
      return function (a, b) {
        return b[1]['$date'] - a[1]['$date']
      }
    }
    db.collection('user').doc(String(this.data.me)).get().then(res => {
      var log = res.data.browseLog
      var p = []
      var d = []
      var u = []
      var needP = []
      var needU = []
      var rp = []
      var ru = []
      log.sort(cmp())
      var fin = 0
      var tg = 2//log.length
      var thee = this
      function finz() {
        //console.log('aaa')
        //console.log('www',rp,ru)
        for (let i = 0; i < log.length; ++i) {
          for (let j = 0; j < rp.length; ++j) {
            if (rp[j]._id == String(log[i][0])) {
              p[i] = rp[j]
              break
            }
          }
          for (let j = 0; j < ru.length; ++j) {
            if (ru[j]._id == String(log[i][2])) {
              u[i] = ru[j]
              break
            }
          }
        }
        thee.setData({
          posts: p,
          dates: d,
          loading: false,
          users: u,
        })
      }
      if (tg == 0) finz() //修复了bug
      for (let i = 0; i < log.length; ++i) {
        d[i] = log[i][1]
        log[i][1] = new Date(log[i][1]['$date'])
        d[i] = modu.dateArr(log[i][1])
        needP.push(String(log[i][0]))
        needU.push(log[i][2])
      }
      needU = Array.from(new Set(needU))
      //console.log('iloveu',needP, needU)
      const et = 20
      const rru = Math.ceil(needU.length / et)
      const rrp = Math.ceil(needP.length / et)
      tg = rru + rrp
      for (let i = 0; i < rru; ++i) {
        var temp = []
        var len = (i + 1) * et < needU.length ? (i + 1) * et : needU.length
        for (let j = i * et; j < len; ++j) temp.push(needU[j])
        db.collection('user').where({ _id: _.in(temp) }).get().then(rea => {
          ru = ru.concat(rea.data)
          if (++fin == tg) finz()
        }).catch(rwa => {
          wx.showToast({
            title: '读取用户信息失败！at' + String(i),
            icon: 'none',
          })
        })
      }
      for (let i = 0; i < rrp; ++i) {
        var temp = []
        var len = (i + 1) * et < needP.length ? (i + 1) * et : needP.length
        for (let j = i * et; j < len; ++j) temp.push(needP[j])
        db.collection('post').where({ _id: _.in(temp) }).get().then(reb => {
          rp = rp.concat(reb.data)
          if (++fin == tg) finz()
        }).catch(rwb => {
          wx.showToast({
            title: '读取帖子信息失败！ at' + String(i),
            icon: 'none',
          })
        })
      }
      /*db.collection('post').doc(String(log[i][0])).get().then(ret => {
        db.collection('user').doc(String(ret.data.user)).get().then(reu => {
          u[i] = reu.data
          if (++fin == tg << 1) finz()
        }).catch(rwu => {
          u[i] = modu.fakeUser
          if (++fin == tg << 1) finz()
        })
        p[i] = ret.data
        if (++fin == tg << 1) finz()
      }).catch(rwt => {
        fin += 2
        p[i] = modu.fakePost
        u[i] = modu.fakeUser
        if (fin == tg << 1) finz()
      })
    }*/
    }).catch(rws => {
      wx.showToast({
        title: '账户信息异常！',
        icon: 'none',
      })
    })
  },

  gotoPost: function (e) {
    var temp = this.data.posts
    var idx = -1
    for (let i = 0; i < temp.length; ++i) {
      if (Number(e.currentTarget.id) == temp[i].id) {
        idx = i
        break
      }
    }
    if (temp[idx].fatherPost) {//原理上恒为true
      wx.navigateTo({
        url: '/pages/postt/postt?id=' + String(temp[idx].fatherPost),
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