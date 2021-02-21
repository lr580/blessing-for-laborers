// pages/me/me.js
const db = wx.cloud.database()
const _ = db.command
var userID
var me
var hasNewInfo
var uid
var code
var newAvatarUrl

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    code: null,
    uid: null,
    nickName: '',
    userImg: '',
    userCity: '',
    school: '',
    schoolArea: '',
    gender: '',
    loadKey: false,
    changeInfokey: false,
    nwInfo: false,//与全局变量含义一致
    major: '',
  },

  console1: function () {
    console.log(1)
  },

  gotoMypost: function () {
    wx.navigateTo({
      url: '/pages/mypost/mypost',
    })
  },

  gotoHistory: function () {
    wx.navigateTo({
      url: '/pages/history/history',
    })
  },

  gotoCollect: function () {
    wx.navigateTo({
      url: '/pages/collect/collect',
    })
  },

  gotoHelp: function () {
    wx.navigateTo({
      url: '/pages/help/help',
    })
  },

  gotoInfo: function () {
    getApp().globalData.hasNewInfo = 0
    //wx.removeTabBarBadge({ index: 2, })
    wx.navigateTo({
      url: '/pages/infos/infos',
    })
  },

  //获取用户授权信息
  FgetuserInfo: function (uid) {
    var openid
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    

    console.log('uid', uid)
    db.collection("user").doc(String(uid)).get().then(res => {
      res = res.data
      var avatarUrl = res.avatarUrl
      var userInfo = res.userInfo
      console.log(userInfo);
      var nickName = res.nickName
      //console.log('nnn', nickName)
      var userCity = userInfo.city
      var gender = userInfo.gender
      openid = res._openid;

      if (gender == 1) {
        gender = '男'
      } else if (gender == 2) {
        gender = '女'
      } else {
        gender = '未知'
      }
      that.setData({
        nickName: nickName,
        avatarUrl: avatarUrl,
        gender: gender,
        userCity: userCity,
        loadKey: true,
        changeInfokey: true,
        nwInfo: res.newInfo,
        major: res.major,
        school: res.school,
        schoolArea: res.schoolArea,
      })
      console.log("user_openid " + openid)
      wx.hideLoading()
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    code = Number(options.code)
    uid = options.uid
    userID = app.globalData.userID
    me = app.globalData.me
    hasNewInfo = app.globalData.hasNewInfo
    this.setData({
      code: code,
      uid: uid
    })
    this.FgetuserInfo(uid)
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
    this.FgetuserInfo(uid)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: async function () {
    app.globalData.userID = userID
    app.globalData.me = me
    app.globalData.hasNewInfo = hasNewInfo
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
