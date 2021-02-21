// pages/discuss/discuss.js
const modu = require('../../lrfx.js')
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,//是否展示弹出层
    pageType: 0,//为0是交流页，为1是问答页
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
    distinctS: false,//搜索文本是否区分标题和正文
    titleS: '',//搜索标题
    contentS: '',//搜索正文
    textS: '',//搜索文本
    typesS: [false, false, true, true, true],//选中的搜索帖子类型
    userS: '',//搜索用户名
    dateBS: '2021-02-06',//搜索起始日期范围
    dateES: '2021-02-08',//搜索结束时间范围
    BGD: '2021-02-01',//起始日期
    EGD: '2023-02-01',//终止日期
    tags: [],//标签列表
    tagsS: [],//搜索选中标签列表(布尔值数组)
    replyS: false,//搜索包含回帖
    anonymityS: true,//搜索包含匿名用户
    insearch: false,//是否在搜索
    bgdt: new Date(),//搜索起始日期范围对象
    eddt: new Date(),//搜索结束日期范围对象
    username: [],//所有用户名与id对应列表
    typeDown: false,//搜索栏标签是否下拉中
    searchDown: false,//搜索栏是否展开高级搜索
  },
  //以下为控制弹出层的函数
  showPopup() {
    this.setData({ show: true });
  },

  onClose() {
    this.setData({ show: false });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var dem = {
      hide: false,
    }
    const _ = wx.cloud.database().command
    if (this.data.pageType == 0) dem['type'] = _.neq(0).and(_.neq(1))
    else dem['type'] = 1

    this.setData({
      me: getApp().globalData.userID,
      pathp: getApp().globalData.pathp,
      pathtp: getApp().globalData.pathtp,
      types: ['全部'].concat(getApp().globalData.types),
      dem: dem,
      dateBS: getApp().globalData.dateBS,
      dateES: getApp().globalData.dateES,
    })
    //console.log('me', this.data.me)
    wx.cloud.database().collection('global').doc('catagory').get().then(res => {
      var temp = res.data.cat
      var t2 = []
      for (let i = 0; i < temp.length; ++i) t2.push(false)

      function cmp() {//降序排列标签
        return function (a, b) {
          return b[0] - a[0]
        }
      }
      temp.sort(cmp())
      this.setData({
        tags: temp,
        tagsS: t2,
      })
    })

    wx.cloud.database().collection('global').doc('username').get().then(res => {
      this.setData({ username: res.data })
    })

    this.firstLoad()
  },

  firstLoad: function () {//加载第一版帖子
    var dem = this.data.dem
    delete dem['activeTime']
    var thee = this
    this.setData({ alreadyAll: false })
    wx.showLoading({
      title: '加载中',
    })
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

          for (let i = 0; i < res.data.length; ++i) {
            temp[i][0] = res.data[i]
            temp[i][2] = modu.dateArr(res.data[i].activeTime)
            temp[i][3] = modu.getABS(res.data[i].content)
            wx.cloud.database().collection('user').doc(String(res.data[i].user)).get().then(ret => {
              ++fina
              temp[i][1] = ret.data
              if (fina == res.data.length) {
                wx.hideLoading()
                thee.setData({
                  postn: res.data.length,
                  posts: temp,
                })
              }
            }).catch(rwt => {
              ++fina
              temp[i][1] = modu.fakeUser
              if (fina == res.data.length) {
                wx.hideLoading()
                thee.setData({
                  postn: res.data.length,
                  posts: temp,
                })
              }
            })
          }
        },
        fail: res => {
          wx.hideLoading()
          wx.showToast({
            title: '加载失败！',
            icon: 'none',
          })
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
    if (!this.data.posts.length) return
    var lastLeastActiveTime = this.data.posts[this.data.posts.length - 1][0].activeTime
    var olen = this.data.posts.length //原本加载了多少帖子
    var dem = this.data.dem
    var bggt = this.data.bgdt
    var edgt = this.data.eddt
    wx.showLoading({
      title: '加载中',
    })
    if (!this.data.insearch) {
      if (this.data.order == 'desc')//就现实情况而言，不存在两个帖子同时发布
        dem['activeTime'] = wx.cloud.database().command.lt(lastLeastActiveTime)
      else dem['activeTime'] = wx.cloud.database().command.gt(lastLeastActiveTime)
    } else {
      const _ = wx.cloud.database().command
      //console.log('www', dem, typeof dem)
      if (dem['operands'] != undefined) {
        //console.log(1)
        if (this.data.order = 'desc') {
          dem.operands[0]['activeTime'] = _.gt(bggt).and(_.lt(lastLeastActiveTime))
          dem.operands[1]['activeTime'] = _.gt(bggt).and(_.lt(lastLeastActiveTime))
        } else {
          dem.operands[0]['activeTime'] = _.gt(lastLeastActiveTime).and(_.lt(edgt))
          dem.operands[1]['activeTime'] = _.gt(lastLeastActiveTime).and(_.lt(edgt))
        }
        //console.log(dem)
      } else {
        //console.log(2)
        if (this.data.order == 'desc')
          dem['activeTime'] = _.gt(bggt).and(_.lt(lastLeastActiveTime))
        else dem['activeTime'] = _.gt(lastLeastActiveTime).and(_.lt(edgt))
      }
    }
    //console.log('dem',dem)
    wx.cloud.database().collection('post').where(dem).limit(this.data.freshLoads)
      .orderBy('activeTime', this.data.order).get().then(res => {
        var fina = 0
        var temp = []//读取数据暂存
        if (!res.data.length) this.setData({ alreadyAll: true }), wx.hideLoading()

        for (let i = 0; i < res.data.length; ++i) temp[i] = []

        for (let i = 0; i < res.data.length; ++i) {
          temp[i][0] = res.data[i]
          temp[i][2] = modu.dateArr(res.data[i].activeTime)
          temp[i][3] = modu.getABS(res.data[i].content)
          wx.cloud.database().collection('user').doc(String(res.data[i].user)).get().then(ret => {
            ++fina
            temp[i][1] = ret.data
            if (fina == res.data.length) {
              wx.hideLoading()
              this.setData({
                postn: this.data.postn + res.data.length,
                posts: this.data.posts.concat(temp),
              })
            }
          }).catch(rwt => {
            ++fina
            temp[i][1] = modu.fakeUser
            if (fina == res.data.length) {
              wx.hideLoading()
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
    /*wx.showToast({
      title: '刷新成功',
      duration: 1500,
    })*/
  },

  gotoPost: function (e) {
    var temp = this.data.posts
    var idx = -1
    for (let i = 0; i < this.data.postn; ++i) {
      if (Number(e.currentTarget.id) == temp[i][0].id) {
        idx = i
        break
      }
    }
    //console.log(temp[idx][0].type,temp[idx][0].fatherPost)
    if (temp[idx][0].fatherPost) {
      wx.navigateTo({
        url: '/pages/postt/postt?id=' + String(temp[idx][0].fatherPost),
      })
    } else {
      wx.navigateTo({
        url: '/pages/postt/postt?id=' + String(e.currentTarget.id),
      })
    }
    this.setData({ unfresh: true })
  },

  selectType: function (e) {
    this.setData({ type: Number(e.currentTarget.id) })
    var ty = Number(e.currentTarget.id)
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

  selectST: function (e) {
    this.setData({ order: e.currentTarget.id })
    this.firstLoad()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var fr = this.data.unfresh
    if (fr) this.firstLoad()
  },

  switchDI: function (e) {
    this.setData({ distinctS: e.detail.value.includes('dist') })
  },

  inputTitle: function (e) {
    this.setData({ titleS: e.detail.value })
  },

  inputContent: function (e) {
    this.setData({ contentS: e.detail.value })
  },

  inputText: function (e) {
    this.setData({
      titleS: e.detail.value,
      contentS: e.detail.value,
      textS: e.detail.value,
    })
  },

  inputUser: function (e) {
    if (e.detail.value) {
      this.setData({ anonymityS: false })
    }
    this.setData({ userS: e.detail.value })
  },

  switchType: function (e) {
    var temp = [false, false, false, false, false]
    var edv = e.detail.value
    var ty = this.data.types
    for (let i = 1; i <= 4; ++i) {
      temp[i] = edv.includes(ty[i])
    }
    this.setData({ typesS: temp })
  },

  switchBS: function (e) {
    this.setData({ dateBS: e.detail.value })
  },

  switchES: function (e) {
    this.setData({ dateES: e.detail.value })
  },

  selectTag: function (e) {
    var temp = []
    var idx = e.currentTarget.id
    var v = e.detail.value
    for (let i = 0; i < this.data.tags.length; ++i) {
      temp.push(v.includes(this.data.tags[i][1]))
    }
    this.setData({ tagsS: temp })
  },

  switchIR: function (e) {
    this.setData({ replyS: e.detail.value.includes('replyS') })
  },

  switchAN: function (e) {
    if (this.data.userS) {
      wx.showToast({
        title: '搜索条件含发帖者时不能搜索匿名用户',
        icon: 'none',
      })
      this.setData({ anonymityS: false })
      return
    }
    this.setData({ anonymityS: e.detail.value.includes('anonymityS') })
  },

  search: function (e) {
    this.setData({ show: false });//自动关闭弹出层
    var _ = wx.cloud.database().command
    var bgdt = new Date(this.data.dateBS)
    var eddt = new Date(this.data.dateES)
    eddt = eddt.setDate(eddt.getDate() + 1)
    eddt = new Date(eddt)
    //console.log(bgdt,eddt)
    var demp = {//共性要求
      activeTime: _.gt(bgdt).and(_.lt(eddt)),
      hide: false,
    }

    var ty = []
    for (let i = 1; i <= 4; ++i) if (this.data.typesS[i]) ty.push(i)
    if (this.data.replyS) {
      ty.push(0)
      if (ty.length) demp['fatherType'] = _.in(ty)//回帖fatherType有0也无所谓
    }
    if (ty.length) demp['type'] = _.in(ty)

    var tagn = 0
    var stag = []
    for (let i = 0; i < this.data.tags.length; ++i) if (this.data.tagsS[i]) {
      ++tagn
      stag.push(this.data.tags[i][1])
    }
    if (tagn) demp['tag'] = _.in(stag)
    if (!this.data.anonymityS) demp['anonymity'] = false

    var user = []
    if (this.data.userS) {
      var un = this.data.username
      var fx = new RegExp('.*' + this.data.userS + '.*', 'im')
      for (var name in un) {
        if (name.search(fx) == 0) {
          user.push(un[name])
        }
      }
      demp['user'] = _.in(user)
      demp['anonymity'] = false
    }

    var dem1
    if (this.data.distinctS) {
      if (this.data.titleS) demp['title'] = wx.cloud.database().RegExp({
        regexp: '.*' + this.data.titleS + '.*',
        options: 'is',
      })
      if (this.data.contentS) demp['content'] = wx.cloud.database().command.elemMatch({
        '1': wx.cloud.database().RegExp({
          regexp: '.*' + this.data.contentS + '.*',
          options: 'is',
        })
      })
      dem1 = demp
    } else {
      var d1 = {}, d2 = {}
      for (let k in demp) {
        d1[k] = demp[k]
        d2[k] = demp[k]
      }
      if (this.data.textS) {
        d1['title'] = wx.cloud.database().RegExp({
          regexp: '.*' + this.data.titleS + '.*',
          options: 'is',
        })
        d2['content'] = wx.cloud.database().command.elemMatch({
          '1': wx.cloud.database().RegExp({
            regexp: '.*' + this.data.contentS + '.*',
            options: 'is',
          })
        })
      }
      dem1 = _.or([d1, d2])
    }

    //console.log(dem1)
    this.setData({
      dem: dem1,
      insearch: true,
      bgdt: bgdt,
      eddt: eddt,
    })
    this.firstLoad()
  },

  postize: function (e) {
    wx.navigateTo({
      url: '../postp/postp?reply=0&type=2&edit=false',
    })
    this.onLoad()
  },

  typeDownize: function (e) {
    this.setData({ typeDown: !this.data.typeDown })
  },

  searchDf: function (e) {
    this.setData({ searchDown: !this.data.searchDown })
  },

  gotoUser: function (e) {
    var ori = e.currentTarget.id.split(',')
    var uid = ori[0]
    var ann = ori[1] == 'true'//是否匿名
    var code
    //console.log('gotoUser with', uid, ann)
    //console.log(uid)
    if (!uid) return
    if (ann) return
    if (uid == app.globalData.userID) {
      code = 0
    }
    else {
      code = 1
    }
    //console.log("before " + code + " " + uid + " " + app.globalData.userID)
    wx.navigateTo({
      url: '/pages/info/info?uid=' + uid + "&code=" + code,
    })
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