// pages/me/me.js
const db = wx.cloud.database()
const _ = db.command

var app = getApp();

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
    nwInfo:false,//与全局变量含义一致
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

  gotoInfo:function(){
    getApp().globalData.hasNewInfo=0
    wx.removeTabBarBadge({index: 2,})
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
        console.log(res);
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
            getApp().globalData.hasNewInfo=false
            that.setData({nwInfo:false})
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
                newInfo:false,
                infos:[],
              }
            }).catch(rww => {
              wx.showToast({
                title: '更新信息失败！',
                icon:'none',
              })
            })
            db.collection("user").where({
              _openid: openid
            }).get().then(res => {
              console.log("THIS　IＳ    " + res)
              getApp().globalData.me = res.data._id
              getApp().globalData.me = res.data[0]._id
              var obj = {}
              obj[res.data[0].nickName] = res.data[0]._id
              db.collection('global').doc('username').update({
                data: obj
              }).then(ret => {
                //console.log('suc add to global')
              })
            }).catch(rwr => {
              wx.showToast({
                title: '获取信息失败！',
                icon:'none',
              })
            })
          } else {
            console.log("用户已存在")
            db.collection("user").where({
              _openid: openid
            }).get().then(res => {
              app.globalData.userID = res.data[0]._id
              //console.log(app.globalData.userID)
              getApp().globalData.me = res.data[0]._id
              //console.log('www',res.data[0].newInfo)
              getApp().globalData.hasNewInfo=res.data[0].newInfo
              that.setData({nwInfo:res.data[0].newInfo})
              if(res.data[0].newInfo) wx.setTabBarBadge({index: 2,text: String(res.data[0].newInfo),})
              //console.log('wwwwww')

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
                        console.log('update case of rename')
                      }).catch(rwb => {
                        wx.showToast({
                          title: '修改信息失败！',
                          icon:'none',
                        })
                      })
                    }
                  }
                }
              }).catch(rwa => {
                wx.showToast({
                  title: '获取信息失败！',
                  icon:'none',
                })
              })
            }).catch(rws => {
              wx.showToast({
                title: '获取信息失败！',
                icon:'none',
              })
            })
          }
        }).catch(rws => {
          wx.showToast({
            title: '获取信息失败，请重启！',
            icon:'none',
          })
        })

      },
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*const cc = db.collection('user')
    cc.get().then(rer=>{
      for(let i=0;i<rer.data.length;++i){
        cc.doc(String(rer.data[i]._id)).update({
          data:{
            newInfo:false,
            infos:[],
          }
        }).then(res=>{
          console.log(i)
        })
      }
    })*/
    /*db.collection('user').update({
      data:{
        newInfo:false,
        infos:[],
      }
    }).then(res=>{
      console.log(res)
    })*/
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
    /*const t=getApp().globalData.hasNewInfo
    if(t) wx.setTabBarBadge({index: 2,text: String(t),}) 
    else  wx.removeTabBarBadge({index: 2,})
    console.log('ggg')*/
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