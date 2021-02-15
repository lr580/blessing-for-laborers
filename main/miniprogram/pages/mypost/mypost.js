// pages/collect/collect.js
const db=wx.cloud.database()
const _=db.command
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mypost:[],
    dataArr:[],
    name:null,
    tag:null,
    tutle:null
  },

  getData:async function(){
    var res=await db.collection("user").doc(app.globalData.userID).get().then(res=>{
      this.setData({
        dataArr:res.data.publish
      })
     
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady:  function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow:async function () {
    var res=await this.getData()
    for(var i=0,len=this.data.dataArr.length;i<len;i++){
      var res= await db.collection("post").doc(String(this.data.dataArr[i])).get().then(res=>{
        var type=null
        var name
        if(res.data.type==1){type="问答"}
        else if(res.data.type==2){type="交流"}
        else if(res.data.type==3){type="分享"}
        else{type="日志"}
        this.data.mypost.push({title:res.data.title,tag:res.data.tag,pid:res.data._id,type:type})
        this.setData({
          mypost:this.data.mypost
        })
      })
    }
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
