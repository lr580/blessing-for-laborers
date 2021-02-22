// pages/collect/collect.js
const db = wx.cloud.database()
const _ = db.command
var app = getApp();
var uid
var code=0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: 0,
    mypost: [],
    dataArr: [],
    name: null,
    tag: null,
    tutle: null,
    unfresh: false,
  },

  getData: async function () {
    //if(this.data.unfresh) return
    var res = await db.collection("user").doc(uid).get().then(res => {
      this.setData({
        dataArr: res.data.publish
      })

    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    uid = app.globalData.userID
    if (options.code == 1) {
      uid = options.uid
      code = options.code
    }
    //console.log("UID IS "+options.uid)
    //console.log("CODE IS "+options.code)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    var mypost=[]
    this.getData()
    var alluser
    var res=await db.collection("user").get().then(res=>{
      alluser=res.data
    })
    // console.log(this.data.dataArr)
    if (this.data.unfresh) return //禁止重复加载
    //由于onshow的意思是当(从隐藏到显示而不是从关闭到打开)
    //其实以下内容应该放onLoad的，但上一行代码已经弥补这个故障了
    //页面必须关闭后打开才刷新，否则需要做太多if判断
    var res = await this.getData()
    wx.showLoading({
      title: '加载中...',
    })
    var postowner
    var tempDataArr
    var now=0
    for (var i = 0, len = this.data.dataArr.length; i < len; i=i+20) {
      tempDataArr=this.data.dataArr.slice(now)
      if(tempDataArr.length>=20){
        tempDataArr=tempDataArr.slice(now,now+20)
        now=now+20
      }
      for(var k=0;k<tempDataArr.length;k++){
        tempDataArr[k]=String(tempDataArr[k])
      }
      
      var res=await db.collection("post").where({ _id: _.in(tempDataArr) }).get().then(res=>{
        tempDataArr=res.data
      })
      for(var j=0;j<tempDataArr.length;j++){
        postowner=tempDataArr[j].user
        for(var l=0;l<alluser.length;l++){
          if(alluser[l]._id==postowner){
            postowner=alluser[l].nickName
            break
          }
        }
          var type = null
          var day = tempDataArr[j].activeTime.getDate()
          var year = tempDataArr[j].activeTime.getFullYear()
          var month = tempDataArr[j].activeTime.getMonth() + 1//月份从0开始算
          if (month < 10) { month = "0" + String(month) }
          var hour = tempDataArr[j].activeTime.getHours()
          if (hour < 10) { hour = "0" + String(hour) }
          var min = tempDataArr[j].activeTime.getMinutes()
          if (min < 10) { min = "0" + String(min) }
          var sec = tempDataArr[j].activeTime.getSeconds()
          if (sec < 10) { sec = "0" + String(sec) }
          if (tempDataArr[j].type == 1) { type = "问答" }
          else if (tempDataArr[j].type == 2) { type = "交流" }
          else if (tempDataArr[j].type == 3) { type = "分享" }
          else if (tempDataArr[j].type == 4) { type = "日志" }
          if(tempDataArr[j].title=="" && code==1){
            //console.log(uid==getApp().globalData.userID, uid, getApp().globalData.userID)
            tempDataArr[j].title=(uid==getApp().globalData.userID)?"我的回复":'Ta的回复'
          }
          if(tempDataArr[j].title=="" && code==0){
            tempDataArr[j].title="我的回复"
          }            
          //console.log(tempDataArr)
          if(tempDataArr[j].type==0){
            tempDataArr[j]._id=String(tempDataArr[j].fatherPost)
          }
          //console.log(tempDataArr[j]._id)
          mypost.push({ title: tempDataArr[j].title, tag: tempDataArr[j].tag, activeTime: year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec, type: type, postowner: postowner, id: tempDataArr[j]._id })
      }
    }
      
      this.setData({
        mypost:mypost.reverse(),
        flag:1
      })
      wx.hideLoading()
  },

  gotoPost: function (e) {
    var temp = this.data.mypost
    console.log('tmp', temp)
    var idx = -1
    for (let i = 0; i < temp.length; ++i) {
      if (Number(e.currentTarget.id) == temp[i].id) {
        idx = i
        break
      }
    }
    console.log(Number(e.currentTarget.id), idx)
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
