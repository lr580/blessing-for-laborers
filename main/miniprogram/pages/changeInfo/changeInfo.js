// pages/changeInfo/changeInfo.js
const db=wx.cloud.database()
const _=db.command
var app = getApp();
var code=0
var uid

Page({

  /**
   * 页面的初始数据
   */
  data: {
    code:0,
    userinfo:{ },
    nickname:'无',
    user:null,
    area: '无',
    major:'无',
    grade:'无',
    school:'无'
  },


/*获取昵称头像，无作用*/
  onLoad: async function (options) {
    uid=app.globalData.userID
    if(options.code==1){
      code=1
      uid=options.uid
      this.setData({
        code:code
      })
    }
    console.log("CODE IS "+code)
    console.log("UID IS "+uid)
    if(code==0){
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
          nickname: res.data.nickName
        })
      })
    }
    else{
      var res = await db.collection("user").doc(uid).get().then(res=>{
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
          nickname: res.data.nickName
        })
      })
    }
    
  },

  getSchool: function(e){
    this.setData({
      school:e.detail.value
    })
    var res= db.collection("user").doc(uid).update({
      data:{
        school:this.data.school
      }
    })
  },

  getArea: function(e){
    this.setData({
      area:e.detail.value
    })
    var res= db.collection("user").doc(uid).update({
      data:{
        schoolArea:this.data.area
      }
    })
  },

  getNickName: function(e){
    this.setData({
      nickname:e.detail.value
    })
    var res= db.collection("user").doc(uid).update({
      data:{
        nickName:this.data.nickname
      }
    })
  },

  getMajor: function(e){
    this.setData({
      major:e.detail.value
    })
    var res= db.collection("user").doc(uid).update({
      data:{
        major:this.data.major
      }
    })
  },

  getGrade: function(e){
    this.setData({
      grade:e.detail.value
    })
    var res= db.collection("user").doc(uid).update({
      data:{
        grade:this.data.grade
      }
    })
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
