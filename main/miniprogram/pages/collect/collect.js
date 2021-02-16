// pages/collect/collect.js
const db=wx.cloud.database()
const _=db.command
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    datacollect:[],
    dataArr:[],
    name:null,
    tag:null,
    tutle:null
  },

  getData:async function(){
    var res=await db.collection("user").doc(app.globalData.userID).get().then(res=>{
      this.setData({
        dataArr:res.data.collect
      })
     
    })
  },
  // collect:async function(){
  //   var res=await this.getData()
  //   for(var i=0,len=this.data.dataArr.length;i<len;i++){
  //     var res= await db.collection("post").doc(String(this.data.dataArr[i])).get().then(res=>{
  //       var type=null
  //       var name
  //       if(res.data.type==1){type="问答"}
  //       else if(res.data.type==2){type="交流"}
  //       else if(res.data.type==3){type="分享"}
  //       else{type="日志"}
  //       this.data.datacollect.push({title:res.data.title,tag:res.data.tag,actTime:res.data.activeTime,type:type})
  //     })
  //   }
  // },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    // var res=await this.getData()
    // for(var i=0,len=this.data.dataArr.length;i<len;i++){
    //   var res= await db.collection("post").doc(String(this.data.dataArr[i])).get().then(res=>{
    //     var type=null
    //     var name
    //     if(res.data.type==1){type="问答"}
    //     else if(res.data.type==2){type="交流"}
    //     else if(res.data.type==3){type="分享"}
    //     else{type="日志"}
    //     app.globalData.collect.push({title:res.data.title,tag:res.data.tag,actTime:res.data.activeTime,type:type})
    //     console.log(app.globalData.collect)
    //   })

    // }
    
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
    wx.showLoading({
      title: '加载中...',
    })
    var postowner

    for(var i=0,len=this.data.dataArr.length;i<len;i++){

      var res= await db.collection("post").doc(String(this.data.dataArr[i])).get().then(res=>{
        postowner=res.data.user
      })
      var res= await db.collection("user").doc(String(postowner)).get().then(res=>{
        postowner=res.data.nickName
      })

      var res= await db.collection("post").doc(String(this.data.dataArr[i])).get().then(res=>{
        var type=null
        var day=res.data.activeTime.getDate()
        var year=res.data.activeTime.getFullYear()
        var month=res.data.activeTime.getMonth()
        if(month<10){month="0"+String(month)}
        var hour=res.data.activeTime.getHours()
        if(hour<10){hour="0"+String(hour)}
        var min=res.data.activeTime.getMinutes()
        if(min<10){min="0"+String(min)}
        var sec=res.data.activeTime.getSeconds()
        if(sec<10){sec="0"+String(sec)}
        if(res.data.type==1){type="问答"}
        else if(res.data.type==2){type="交流"}
        else if(res.data.type==3){type="分享"}
        else{type="日志"}
        this.data.datacollect.push({title:res.data.title,tag:res.data.tag,activeTime:year+"/"+month+"/"+day+" "+hour+":"+min+":"+sec,type:type,postowner:postowner})
        if(i==len-1){
        wx.hideLoading(),
        this.setData({
          datacollect:this.data.datacollect
        })
        }
      })
    }
    console.log(this.data.datacollect)
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
