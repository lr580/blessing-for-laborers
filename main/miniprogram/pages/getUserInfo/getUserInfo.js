// pages/getUser/getUser.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    goinKey:false
  },
  //获取用户授权信息
auth:function(e){
var userInfo = JSON.stringify(e.detail.userInfo)
console.log(userInfo);
this.setData({
  userInfo:e.detail.userInfo,
  goinKey:true
});
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  gotoApp:function(){
    wx.switchTab({
      url: '/pages/quesAndans/quesAndans',
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