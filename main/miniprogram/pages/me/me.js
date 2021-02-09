// pages/me/me.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',
    userImg: '',
    userCity: '',
    school: '',
    schoolArea: '',
    gender: '',
    loadKey: false,
    changeInfokey: false
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
  //获取用户授权信息
  FgetuserInfo: function () {

    var that = this;
    wx.getUserInfo({
      success: function (res) {
        console.log(res);
        var userInfo = res.userInfo
        console.log(userInfo);
        var nickName = userInfo.nickName
        var avatarUrl = userInfo.avatarUrl
        var userCity = userInfo.city
        var gender = userInfo.gender
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
          changeInfokey: true
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.FgetuserInfo()//调试
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