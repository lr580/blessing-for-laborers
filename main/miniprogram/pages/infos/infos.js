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
    infos: [],//消息记录(0是日期(string),1是是否已读，2是消息模式，3是帖子对象，4是用户对象, 5是原贴对象,6(bool)是否匿名用户,)
    unfresh: false,
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
        //var stdDate = new Date()
        //stdDate = stdDate.setDate(stdDate.getDate() - 3)
        //console.log('stddate', stdDate)
        for (let i = 0; i < ioa.length; ++i) {
          //console.log(i,ioa[i][0]['$date'] >= stdDate, ioa[i][0]['$date'], stdDate)
          //if (ioa[i][0]['$date'] >= stdDate) iob.push(ioa[i])//,console.log('iob',iob)
          if (!ioa[i][1]) iob.push(ioa[i])
        }
      }
      //console.log('555',iob)
      var fin = 0
      var suc = iob.length << 1
      //console.log(fin, suc, iob.length<<1)
      var thee = this
      var ruser = []
      var rpost = []
      function succ() {
        //console.log('gg', ruser, rpost)
        for (let i = 0; i < iob.length; ++i) {
          iob[i][0]=modu.dateStr(new Date(iob[i][0]['$date']))
          for (let j = 0; j < rpost.length; ++j) {
            if (String(iob[i][3]) == rpost[j]._id) {
              iob[i][3] = rpost[j]
              break
            }
          }
          for (let j = 0; j < rpost.length; ++j) {
            if (String(iob[i][5]) == rpost[j]._id) {
              iob[i][5] = rpost[j]
              break
            }
          }
          if (iob[i][4] == 0) {
            iob[i][6] = true
          }
          else {
            iob[i][6] = false
            for (let j = 0; j < ruser.length; ++j) {
              if (String(iob[i][4]) == ruser[j]._id) {
                iob[i][4] = ruser[j]
                break
              }
            }
          }
        }
        //console.log('gggg', iob)
        wx.hideLoading()
        iob.reverse()
        thee.setData({ infos: iob })
        db.collection('user').doc(String(getApp().globalData.userID)).update({
          data: {
            'infos.$[].1': true,
            newInfo: 0,
          }
        }).then(rec => {
          //console.log('www')
        }).catch(rwc => {
          wx.showToast({
            title: '更新状态失败！',
            icon: 'none',
          })
        })
      }
      if (!iob.length) succ()
      else {
        var tuser = []
        var tpost = []
        for (let i = 0; i < iob.length; ++i) {
          tuser.push(String(iob[i][4]))
          tpost.push(String(iob[i][3]))
          tpost.push(String(iob[i][5]))
        }
        tuser = Array.from(new Set(tuser))
        tpost = Array.from(new Set(tpost))
        //console.log('666',tuser,tpost)
        var tulen = Math.ceil(tuser.length)
        var tplen = Math.ceil(tpost.length)
        const ex = 20
        suc = tulen + tplen
        for (let i = 0; i < tulen; ++i) {
          var temp = []
          var jlen = Math.min((i + 1) * ex, tuser.length)
          for (let j = i * ex; j < jlen; ++j) temp.push(tuser[j])
          db.collection('user').where({ _id: _.in(temp) }).get().then(rei => {
            ruser = ruser.concat(rei.data)
            if (++fin == suc) succ()
          }).catch(rwi => {
            wx.showToast({
              title: '获取用户信息错误！' + String(i),
              icon: 'none',
            })
          })
        }
        for (let i = 0; i < tplen; ++i) {
          var temp = []
          var jlen = Math.min((i + 1) * ex, tpost.length)
          for (let j = i * ex; j < jlen; ++j) temp.push(tpost[j])
          db.collection('post').where({ _id: _.in(temp) }).get().then(rej => {
            rpost = rpost.concat(rej.data)
            if (++fin == suc) succ()
          }).catch(rwj => {
            wx.showToast({
              title: '获取帖子信息错误！' + String(i),
              icon: 'none',
            })
          })
        }
      }
      /*for (let i = 0; i < iob.length; ++i) {
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
      }*/
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

  gotoPost: function (e) {
    const eio = e.currentTarget.id.split(',')
    const fid = eio[0]
    const ty = Number(eio[1])
    const pid = eio[2]
    //console.log(eio,fid,ty,pid,'awsl')
    //const io=this.data.infos
    const id = ty ? pid : fid
    wx.navigateTo({
      url: '/pages/postt/postt?id=' + String(id),
    })
    this.setData({ unfresh: true })
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