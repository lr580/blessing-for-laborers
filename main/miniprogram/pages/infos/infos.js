// pages/infos/infos.js
const modu = require('../../lrfx.js')
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAll: false,//是否显示全部消息
    infos: [],//消息记录(0是日期(string),1是是否已读，2是消息模式，3是帖子对象，4是用户对象, 5(bool)是否匿名用户)
    unfresh:false,
  },

  load: function () {
    wx.showLoading({
      title: '加载中……',
    })
    db.collection('user').doc(String(getApp().globalData.userID)).get().then(res => {
      var ioa = res.data.infos
      var iob = []
      if (this.data.showAll) iob = ioa
      else {
        var stdDate = new Date()
        stdDate = stdDate.setDate(stdDate.getDate() - 7)
        console.log('stddate', stdDate)
        for (let i = 0; i < ioa.length; ++i) {
          //console.log(i,ioa[i][0]['$date'] >= stdDate, ioa[i][0]['$date'], stdDate)
          if (ioa[i][0]['$date'] >= stdDate) iob.push(ioa[i])//,console.log('iob',iob)
        }
      }
      var fin = 0
      var suc = iob.length << 1
      //console.log(fin, suc, iob.length<<1)
      var thee = this
      function succ() {
        wx.hideLoading()
        thee.setData({ infos: iob })
        db.collection('user').doc(String(getApp().globalData.userID)).update({
          data:{
            'infos.$[].1':true,
            'newInfo':false,
          }
        }).then(rec=>{
          console.log('www')
        }).catch(rwc=>{
          wx.showToast({
            title: '更新状态失败！',
            icon:'none',
          })
        })
      }
      for (let i = 0; i < iob.length; ++i) {
        iob[i][0]=modu.dateStr(new Date(iob[i][0]['$date']))
        db.collection('post').doc(String(iob[i][3])).get().then(rea => {
          iob[i][3] = rea.data
          //console.log(fin, i, suc, '1')
          if (++fin == suc) succ()
        }).catch(rwa => {
          iob[i][3] = modu.fakePost
          console.log('读取帖子失败！', i)
          if (++fin == suc) succ()
        })
        //console.log('aaa', iob[i][4])
        if (iob[i][4]!=0) {
          iob[i][5] = false
          db.collection('user').doc(String(iob[i][4])).get().then(reb => {
            iob[i][4] = reb.data
            //console.log(fin, i, suc, '2')
            if (++fin == suc) succ()
          }).catch(rwb => {
            iob[i][4] = modu.fakeUser
            console.log('读取用户失败！', i)
            if (++fin == suc) succ()
          })
        } else {
          iob[i][5] = true
          //console.log(fin, i, suc, '3')
          if (++fin == suc) succ()
        }
      }
    }).catch(rws => {
      wx.hideLoading()
      wx.showToast({
        title: '加载失败！',
        icon: 'none',
      })
    })
  },

  switchToAll: function () {
    this.setData({ showAll: !this.data.showAll })
    this.load()
  },

  gotoPost:function(e){
    const eio=e.currentTarget.id.split(',')
    const fid=eio[0]
    const ty=Number(eio[1])
    const pid=eio[2]
    //console.log(eio,fid,ty,pid,'awsl')
    //const io=this.data.infos
    const id=ty?pid:fid
    wx.navigateTo({
      url: '/pages/postt/postt?id='+String(id),
    })
    this.setData({unfresh:true})
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.load()
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