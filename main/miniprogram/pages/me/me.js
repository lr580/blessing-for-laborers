// pages/me/me.js
const db = wx.cloud.database()
const _ = db.command

var app = getApp();
var newAvatarUrl

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
    changeInfokey: false,
    nwInfo: false,//与全局变量含义一致
    major: '',
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

  gotoInfo: function () {
    getApp().globalData.hasNewInfo = 0
    wx.removeTabBarBadge({ index: 2, })
    wx.navigateTo({
      url: '/pages/infos/infos',
    })
  },

  //获取用户授权信息
  FgetuserInfo: async function () {
    var openid
    var that = this;
    wx.getUserInfo({
      success: async function (res) {
        wx.showLoading({
          title: '加载中',
          mask: true,
        })
        console.log(res);
        newAvatarUrl=res.userInfo.avatarUrl
        var userInfo = res.userInfo
        console.log(userInfo);
        var nickName = userInfo.nickName
        var avatarUrl = userInfo.avatarUrl
        var userCity = userInfo.city
        var gender = userInfo.gender
        var re = await wx.cloud.callFunction({
          name: 'getOpenid',
        })

        openid = re.result.openid;

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
        console.log(openid)
        db.collection("user").where({
          _openid: openid
        }).get().then(res => {
          console.log(res.data.length)
          if (res.data.length == 0) {
            getApp().globalData.hasNewInfo = false
            that.setData({ nwInfo: false })
            db.collection("user").add({
              data: {
                userInfo: userInfo,
                nickName: nickName,
                avatarUrl: avatarUrl,
                userCity: userCity,
                gender: gender,
                grade: "",
                major: "",
                school: "",
                schoolArea: "",
                browseLog: [],
                collect: [],
                publish: [],
                thumbs: [],
                history: [],
                newInfo: false,
                infos: [],
              }
            }).catch(rww => {
              wx.hideLoading()
              wx.showToast({
                title: '更新信息失败！',
                icon: 'none',
              })
            })
            db.collection("user").where({
              _openid: openid
            }).get().then(res => {
              getApp().globalData.me = res.data._id
              getApp().globalData.me = res.data[0]._id
              var obj = {}
              obj[res.data[0].nickName] = res.data[0]._id
              db.collection('global').doc('username').update({
                data: obj
              }).then(ret => {
                wx.hideLoading()
                //console.log('suc add to global')
              })
            }).catch(rwr => {
              wx.hideLoading()
              wx.showToast({
                title: '获取信息失败！',
                icon: 'none',
              })
            })
          } else {
            console.log("用户已存在")
            db.collection("user").where({
              _openid: openid
            }).get().then(res => {
              app.globalData.userID = res.data[0]._id
              app.globalData.me = res.data[0]._id
              app.globalData.hasNewInfo = res.data[0].newInfo
              that.setData({ nwInfo: res.data[0].newInfo, })
              that.setData({ major: res.data[0].major, })
              that.setData({ school: res.data[0].school, })
              that.setData({ schoolArea: res.data[0].schoolArea, })
              that.setData({ nickName: res.data[0].nickName, })
              if (res.data[0].newInfo) wx.setTabBarBadge({ index: 2, text: String(res.data[0].newInfo), }).catch(ree => {
                console.log('too fast')
              })
               console.log(newAvatarUrl)
              db.collection("user").doc(app.globalData.userID).update({
                data:{
                  avatarUrl:newAvatarUrl
                }
              })
           


              var obj = {}
              obj[res.data[0].nickName] = res.data[0]._id
              db.collection('global').doc('username').get().then(rea => {
                for (let key in rea.data) {
                  if (rea.data[key] == res.data[0]._id) {
                    if (key != res.data[0].nickName) {
                      var obj2 = {}
                      for (let key in rea.data) {
                        if (key != '_id') {
                          if (rea.data[key] == res.data[0]._id)
                            obj2[key] = wx.cloud.database().command.remove()
                          else obj2[key] = rea.data[key]
                        }
                      }
                      obj2[res.data[0].nickName] = res.data[0]._id
                      db.collection('global').doc('username').update({
                        data: obj2
                      }).then(reb => {
                        wx.hideLoading()
                        console.log('update case of rename')
                      }).catch(rwb => {
                        wx.hideLoading()
                        wx.showToast({
                          title: '修改信息失败！',
                          icon: 'none',
                        })
                      })
                    }
                  }
                  wx.hideLoading()
                }
              }).catch(rwa => {
                wx.hideLoading()
                wx.showToast({
                  title: '获取信息失败！',
                  icon: 'none',
                })
              })
            }).catch(rws => {
              wx.hideLoading()
              wx.showToast({
                title: '获取信息失败！',
                icon: 'none',
              })
            })
          }
        }).catch(rws => {
          wx.hideLoading()
          wx.showToast({
            title: '获取信息失败，请重启！',
            icon: 'none',
          })
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
