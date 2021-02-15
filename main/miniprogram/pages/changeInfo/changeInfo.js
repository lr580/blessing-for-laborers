// pages/changeInfo/changeInfo.js
const db=wx.cloud.database()
const _=db.command
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo:{ },
    nickname:'无',
    user:null,
    area: '无',
    major:'无',
    grade:'无',
    school:'无'
  },


  getSchool: function(e){
    this.data.school=e.detail.value
    var res= db.collection("user").doc(app.globalData.userID).update({
      data:{
        school:this.data.school
      }
    })
  },

  getArea: function(e){
    this.data.area=e.detail.value
    var res= db.collection("user").doc(app.globalData.userID).update({
      data:{
        schoolArea:this.data.area
      }
    })
  },

  getMajor: function(e){
    this.data.major=e.detail.value
    var res= db.collection("user").doc(app.globalData.userID).update({
      data:{
        major:this.data.major
      }
    })
  },

  getGrade: function(e){
    this.data.grade=e.detail.value
    var res= db.collection("user").doc(app.globalData.userID).update({
      data:{
        grade:this.data.grade
      }
    })
  },

/*获取昵称头像，无作用*/
  onLoad: async function (options) {
    var res = await db.collection("user").doc(app.globalData.userID).get().then(res=>{
      console.log(res.data)
      if(res.data.school){
        this.setData({
          school:res.data.school
        })
      }
      if(res.data.schoolArea){
        this.setData({
          area:res.data.schoolArea
        })
      }
      if(res.data.major){
        this.setData({
          major:res.data.major
        })
      }
      if(res.data.grade){
        this.setData({
          grade:res.data.grade
        })
      }
      this.setData({
        userinfo: wx.getStorageSync('userInfo'),
        nickname: wx.getStorageSync('userInfo').nickName
      })
    })
      console.log(this.data.userinfo)
  },


  openAlert:function(e){
    wx.showToast({
      title: e,
      icon:"none"
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */


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
