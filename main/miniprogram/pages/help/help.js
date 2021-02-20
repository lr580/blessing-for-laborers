// miniprogram/pages/help/help.js
const modu = require('../../lrfx.js')
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeNames: ['1'],
    showDetail:[],//下拉框
    content:[],//同数据库内格式
    fail:false,
    pathtp: "cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/postpic/",
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({pathtp:getApp().globalData.pathtp})
    wx.showLoading({title: '加载中……',})
    db.collection('global').doc('help').get().then(res=>{
      wx.hideLoading()
      var sd = []
      for(let i=0;i<res.data.content.length;++i) sd.push(false)
      this.setData({
        content:res.data.content,
        showDetail:sd,
      })
      //console.log(sd, res.data.content)
    }).catch(rws=>{
      wx.hideLoading()
      wx.showToast({
        title: '加载失败',
        icon:'none',
      })
      this.setData({fail:true})
    })
  },

  clickDown:function(e){
    var cd = this.data.showDetail
    cd[Number(e.currentTarget.id)]=!cd[Number(e.currentTarget.id)]
    this.setData({showDetail:cd})
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