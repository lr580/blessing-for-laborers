// pages/discuss/discuss.js
var modu = require('../../lrfx.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    initLoads: 5,//刚打开界面只显示五个帖子
    freshLoads: 3,//下拉刷新增添的帖子
    pathp: "cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/userpic/",//头像图片绝对路径一部分
    pathtp: "cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/postpic/",//帖子图片绝对路径一部分
    posts: [],//所有帖子（第二层下标 0为帖子对象 1用户对象 2最后活跃时间 3缩略内容）
    postn: 0,//目前展示的帖子数
    alreadyAll: false,//已经读完了全部帖子
    me: 0,//当前用户uid
    unfresh: false,//是否需要更新
    types: [],//帖子类型
    dem: {},//帖子的筛选条件
    type: 0,//0代表全选，不代表回帖
    order: 'desc',//时间的筛选条件
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var dem = {
      type: wx.cloud.database().command.neq(0),
      hide: false,
    }
    this.setData({
      me: getApp().globalData.userID,
      pathp: getApp().globalData.pathp,
      pathtp: getApp().globalData.pathtp,
      types: ['全部'].concat(getApp().globalData.types),
      dem: dem,
    })
    this.firstLoad()
  },

  firstLoad: function () {//加载第一版帖子
    var dem = this.data.dem
    var thee = this
    this.setData({ alreadyAll: false })
    //console.log(dem)
    wx.cloud.database().collection('post').where(dem).limit(this.data.initLoads)
      .orderBy('activeTime', this.data.order).get({
        success: res => {
          var fina = 0
          var temp = []//读取数据暂存
          for (let i = 0; i < res.data.length; ++i) temp[i] = []
          if (res.data.length == 0) {
            thee.setData({
              postn: 0,
              posts: [],
            })
            return
          }
          //console.log(res.data.length)

          for (let i = 0; i < res.data.length; ++i) {
            temp[i][0] = res.data[i]
            temp[i][2] = [res.data[i].activeTime.getFullYear(),
            res.data[i].activeTime.getMonth() + 1,
            res.data[i].activeTime.getDate(),
            res.data[i].activeTime.getHours(),
            res.data[i].activeTime.getMinutes(),
            res.data[i].activeTime.getSeconds()]
            temp[i][3] = modu.getABS(res.data[i].content)
            wx.cloud.database().collection('user').doc(String(res.data[i].user)).get().then(ret => {
              ++fina
              temp[i][1] = ret.data
              if (fina == res.data.length) {
                thee.setData({
                  postn: res.data.length,
                  posts: temp,
                })
              }
            })
          }
        },
        fail: res => {
          console.lof('faiff')
          thee.setData({
            postn: 0,
            posts: [],
          })
        }
      })

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var lastLeastActiveTime = this.data.posts[this.data.posts.length - 1][0].activeTime
    var olen = this.data.posts.length //原本加载了多少帖子
    var dem = this.data.dem
    if(this.data.order)//就现实情况而言，不存在两个帖子同时发布
      dem['activeTime'] = wx.cloud.database().command.lt(lastLeastActiveTime)
    else dem['activeTime'] = wx.cloud.database().command.gt(lastLeastActiveTime)
    wx.cloud.database().collection('post').where(dem).limit(this.data.freshLoads)
      .orderBy('activeTime', this.data.order).get().then(res => {
        var fina = 0
        var temp = []//读取数据暂存
        if (!res.data.length) this.setData({ alreadyAll: true })

        for (let i = 0; i < res.data.length; ++i) temp[i] = []

        for (let i = 0; i < res.data.length; ++i) {
          temp[i][0] = res.data[i]
          temp[i][2] = [res.data[i].activeTime.getFullYear(),
          res.data[i].activeTime.getMonth() + 1,
          res.data[i].activeTime.getDate(),
          res.data[i].activeTime.getHours(),
          res.data[i].activeTime.getMinutes(),
          res.data[i].activeTime.getSeconds()]
          temp[i][3] = modu.getABS(res.data[i].content)
          wx.cloud.database().collection('user').doc(String(res.data[i].user)).get().then(ret => {
            ++fina
            temp[i][1] = ret.data
            if (fina == res.data.length) {
              this.setData({
                postn: this.data.postn + res.data.length,
                posts: this.data.posts.concat(temp),
              })
            }
          })
        }
      })
  },

  /**
   * 页面相关事件处理函数--监听用户上拉！动作
   */
  onPullDownRefresh: function () {
    this.firstLoad()
    this.setData({ alreadyAll: false })
    wx.showToast({
      title: '刷新成功',
      duration: 1500,
    })
  },

  gotoPost: function (e) {
    wx.navigateTo({
      url: '/pages/postt/postt?id=' + String(e.currentTarget.id),
    })
    this.setData({ unfresh: true })
  },

  selectType: function (e) {
    this.setData({ type: Number(e.detail.value) })
    var ty = Number(e.detail.value)
    var dem = this.data.dem

    if (!ty) {
      dem['type'] = wx.cloud.database().command.neq(0)
    } else {
      dem['type'] = ty
    }
    delete dem['activeTime']
    this.setData({
      type: ty,
      dem: dem,
    })

    this.firstLoad()
  },

  selectST:function(e){
    this.setData({order: e.detail.value})
    this.firstLoad()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var fr = this.data.unfresh
    if (fr) this.onLoad([])
  },

  /**
 * 生命周期函数--监听页面初次渲染完成
 */
  onReady: function () {

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})