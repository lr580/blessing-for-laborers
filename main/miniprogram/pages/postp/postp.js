// pages/postp/postp.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pid: 0,//当前申请到的帖子id(0为未申请，-1申请失败)
    pub: false,//是否成功发帖
    picn: 0,//当前上传了多少张图片
    anonymity: false,//是否匿名发布
    tx: [[1, '']],//单元
    pathtp: '',
    activeTx: -1,//当前鼠标点中第几个单元(从0开始算)
    me: 0,//发帖人
    reply: 0,//回帖
    tag: '测试',//帖子标签
    type: 1,//帖子类型
    title: '测试标题',//帖子标题
    fatherPost: 0,//被回复帖子
    fatherPageInfo: '被回复内容',//被回复内容
    tags: [],//分类标签集
    busy: false, //true则正在发帖，不能再点击一次发帖
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*for(let i=25;i<=34;++i)
    {
      wx.cloud.database().collection('post').doc(String(i)).get().then(res=>{
        wx.cloud.database().collection('user').doc(String(res.data.user)).update({
          data:{
            publish:wx.cloud.database().command.push(res.data.id)
          }
        }).then(ret=>{console.log(i,res.data.id,res.data.user)})
      })
    }*/

    /*var t = []
    var fin = 0
    const finn = 35
    for (let i = 1; i <= finn; ++i) {
      wx.cloud.database().collection('post').doc(String(i)).get().then(res => {
        var p = res.data.tag
        if (p != '') {
          var found = false
          for (let j = 0; j < t.length; ++j) {
            if (t[j][1] == p) {
              found = true
              ++t[j][0]
            }
          }
          if (!found) t.push([1, p])
        }
        ++fin
        console.log(fin, i, p)
        if (fin == finn) {
          wx.cloud.database().collection('global').doc('catagory').update({
            data: { cat: t }
          }).then(ret => { console.log(t) })
        }
      })
    }*/

    wx.cloud.database().collection('global').doc('catagory').get().then(res => {
      var temp = res.data.cat
      function cmp() {//降序排列标签
        return function (a, b) {
          return b[0] - a[0]
        }
      }
      temp.sort(cmp())
      this.setData({ tags: temp })
    })

    this.setData({
      pathtp: getApp().globalData.pathtp,
      me: getApp().globalData.userID,
      reply: options.reply,
      type: options.type,
    })
    wx.cloud.database().collection('global').doc('default').get().then(res => {
      this.setData({ pid: res.data.maxpid + 1 })
      wx.cloud.database().collection('global').doc('default').update({
        data: {
          maxpid: wx.cloud.database().command.inc(1)//基本假设：没有两个人会在同一时间点进入该页面
        }
      })
    })
  },

  selectImage: function (e) {
    var ths = this
    wx.chooseImage({
      count: 1,
      fail(res) { 'fail', console.log(res) },
      success(res) {
        var tempPath = res.tempFilePaths
        var tempf = tempPath[0].split('.')
        var suffix = tempf[tempf.length - 1]
        wx.showToast({
          title: '上传中',
          duration: 500,
        })
        wx.cloud.uploadFile({
          filePath: tempPath[0],
          cloudPath: "postpic/" + String(ths.data.pid) + '_' + String(++ths.data.picn) + '.' + suffix,
          success: function (ret) {
            var tmpa = ths.data.activeTx
            var temp = ths.data.tx
            var imgUnit = [3, String(ths.data.pid) + '_' + String(ths.data.picn) + '.' + suffix]
            var newActive = -1
            if (tmpa == -1) {//插入顺序存在bug；未支持多张插入
              temp.push(imgUnit)
              temp.push([1, ''])
            }
            else {
              temp.splice(tmpa + 1, 0, imgUnit)
              temp.splice(tmpa + 2, 0, [1, ''])
              newActive = tmpa + 2
            }

            console.log(temp)
            ths.setData({
              tx: temp,
              activeTx: newActive,
            })
            wx.showToast({
              title: '上传成功',
              duration: 1000,
            })
          },
          fail: function (ret) {
            console.log('shit')
            wx.showToast({
              title: '上传失败',
              duration: 1000,
            })
          }
        })

      },
    })
  },

  /**
    * 生命周期函数--监听页面卸载
    */
  onUnload: function () {
    //暂时不设置保存进度，按下返回即删除所有进度
    if (!this.data.pub) {
      wx.cloud.database().collection('global').doc('default').update({//取消发帖，回收帖子id
        data: {
          maxpid: wx.cloud.database().command.inc(-1)
        }
      }).then(res => { console.log('delete', res) })
    }
  },

  selectTag: function (e) {
    this.setData({ tag: e.detail.value })
  },

  switchAnonymity: function (e) {
    this.setData({ anonymity: e.detail.value })
  },

  switchCB: function (e) {
    this.setData({ anonymity: e.detail.value.includes('anonymity') })
  },

  inputText: function (e) {
    var temp = this.data.tx
    var idx = e.currentTarget.id
    temp[idx][1] = e.detail.value
    this.setData({
      tx: temp,
      activeTx: idx,
    })
  },

  inputTitle: function (e) {
    this.setData({ title: e.detail.value })
  },

  delImage: function (e) {//未实体化
    var idx = e.currentTarget.id
    console.log(idx)
  },

  publistPost: function (e) {
    if (!this.data.me)//未登录，应该在onLoad筛一下的，然后强退界面
    {
      wx.showToast({
        title: '尚未登录，无法发帖',
        duration: 1500,
      })
      return
    }
    if (this.data.busy) {
      wx.showToast({
        title: '正在发帖，请勿重复操作',
        icon: 'none',
        duration: 1500,
      })
      return
    }
    this.setData({ busy: true })
    var thee = this
    wx.cloud.database().collection('user').doc(String(this.data.me)).get().then(res => {
      function succ() {
        thee.setData({
          pub: true,
          busy: false,
        })
        wx.navigateBack({})
        wx.showToast({
          title: '发帖成功！刷新后可以查看！',
          icon: 'none',
          duration: 3000,
        })
      }
      var fin = 0
      const finn = 3
      var u = res.data
      var nowTime = new Date()
      var nr = []
      var tagss = this.data.tags
      for (let i = 0; i < tagss.length; ++i) {
        if (tagss[i][1] == this.data.tag) ++tagss[i][0]
      }
      for (let i = 0; i < this.data.tx.length; ++i) {
        if (this.data.tx[i][0] == 3 || this.data.tx[i][1] != '') nr.push(this.data.tx[i])
      }
      //console.log('nr', nr)
      wx.cloud.database().collection('user').doc(String(this.data.me)).update({
        data: { publish: wx.cloud.database().command.push(this.data.pid) }
      }).then(rev => {
        console.log('suc2', rev)
        if (++fin == finn) succ()
      })
      wx.cloud.database().collection('global').doc('catagory').update({
        data: { cat: tagss }
      }).then(rew => {
        console.log('suc3', rew)
        if (++fin == finn) succ()
      })
      wx.cloud.database().collection('post').add({
        data: {
          _id: String(this.data.pid),
          id: this.data.pid,
          activeTime: nowTime,
          editTime: nowTime,
          releaseTime: nowTime,
          tag: this.data.tag,
          comment: [],
          thumbs: 0,
          type: this.data.type,
          reply: this.data.reply,
          anonymity: this.data.anonymity,
          user: u.uid,
          title: this.data.title,
          content: nr,
        }
      }).then(ret => {
        console.log('suc', ret)
        if (++fin == finn) succ()
      })
    })
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