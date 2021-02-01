//帖子的主显示页面
// miniprogram/pages/postt/postt.js
var lr = require('../../lrfx.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postt:{},
    poster:{},
    pathp:"cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/userpic/",
    pathq:"default.jpg",
    pathtp:"cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/postpic/",
    pdate:[],
    replys:0,
    reply:{},
    rdate:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   //这个'1'到时候根据打开的帖子传入的信息修改
    wx.cloud.database().collection('post').doc('1').get().then(res=>{
      this.setData({
        postt:res.data,
        pdate:[res.data.activeTime.getFullYear(),
          res.data.activeTime.getMonth()+1,
          res.data.activeTime.getDate(),
          res.data.activeTime.getHours(),
          res.data.activeTime.getMinutes(),
          res.data.activeTime.getSeconds()],
        replys:res.data.comment.length
      })
      wx.cloud.database().collection('user').doc(String(res.data.user)).get().then(ret=>{
        this.setData({
          poster:ret.data,
          pathq:ret.data.image
        })
      })
      if(res.data.comment.length)
      {
        //加载回帖……明天弄
      }
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
//lr.lr581()
