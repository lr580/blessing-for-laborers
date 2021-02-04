// pages/postp/postp.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pid:0,//当前申请到的帖子id(0为未申请，-1申请失败)
    pub:false,//是否成功发帖
    picn:0,//当前上传了多少张图片
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.database().collection('global').doc('default').get().then(res=>{
      this.setData({pid:res.data.maxpid+1})
      wx.cloud.database().collection('global').doc('default').update({
        data:{
          maxpid:wx.cloud.database().command.inc(1)//基本假设：没有两个人会在同一时间点进入该页面
        }
      })
    })
  },

  selectImage: function(e){
    wx.chooseImage({
      count: 1,
    }).then(res=>{
      var tempPath = res.tempFilePaths
      wx.showToast({
        title: 'title',
        duration: 1000,
      })
      wx.cloud.uploadFile({
        filePath: tempPath[0],
        cloudPath:"postpic/"+String(this.data.pid)+'_'+String(++this.data.picn)+".png",
        success: function(ret){
          wx.showToast({
            title: 'yes!',
            duration:1000,
          })
        },
        fail:function(ret){
          wx.showToast({
            title: 'nooooo!',
            duration:1000,
          })
        }
      })
    })
  },

 /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    //暂时不设置保存进度，按下返回即删除所有进度
    if(!this.data.pub)
    {
      wx.cloud.database().collection('global').doc('default').update({//取消发帖，回收帖子id
        data:{
          maxpid:wx.cloud.database().command.inc(-1)
        }
      })
    }
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