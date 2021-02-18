// pages/postp/postp.js
const modu = require('../../lrfx.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show1: false,//前端使用
    show2: false,//前端使用
    pid: 0,//当前申请到的帖子id(0为未申请，-1申请失败)
    pub: false,//是否成功发帖
    picn: 0,//当前上传了多少张图片
    anonymity: false,//是否匿名发布
    tx: [[1, '']],//单元
    pathtp: '',//路径，见全局变量
    activeTx: -1,//当前鼠标点中第几个单元(从0开始算)
    me: 0,//发帖人
    reply: 0,//回帖
    tag: '',//帖子标签
    type: 1,//帖子类型
    title: '',//帖子标题
    fatherPost: 0,//被回复/编辑帖子id
    fatherPageInfo: '被回复内容',//被回复内容(弃置)
    tags: [],//分类标签集
    busy: false, //true则正在发帖，不能再点击一次发帖
    edit: false,//编辑状态
    pubTime: new Date(),//编辑原贴的发布时间
    replyPost: '',//被回复帖子标题
    replyReply: '',//被回复嵌套对象大纲
    comment: [],//编辑帖子时可能不为空的回帖列表
    thumbs: 0,//编辑帖子时可能不为0的点赞数
    types: [],//帖子类型
    fatherType: 1,//帖子父类类别
  },

  //前端使用
  showPopup1() {
    this.setData({ show1: true });
  },
  onClose1() {
    this.setData({ show1: false });
  },
  showPopup2() {
    this.setData({ show2: true });
  },
  onClose2() {
    this.setData({ show2: false });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      pathtp: getApp().globalData.pathtp,
      me: getApp().globalData.userID,
      reply: Number(options.reply),
      type: Number(options.type),
      edit: options.edit == 'true',
      types: getApp().globalData.types,
    })
    if (!this.data.type) {
      this.setData({
        replyPost: options.rp,
        fatherPost: Number(options.pid),
        fatherType: Number(options.fty),
      })
      if (this.data.reply) {
        this.setData({ replyReply: options.rr })
      }
    }

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
    console.log('opt', options, this.data.edit)

    if (!this.data.edit) {
      wx.cloud.database().collection('global').doc('default').get().then(res => {
        this.setData({ pid: res.data.maxpid + 1 })
        wx.cloud.database().collection('global').doc('default').update({
          data: {
            maxpid: wx.cloud.database().command.inc(1)//基本假设：没有两个人会在同一时间点进入该页面
          }
        })
      })
    }
    else {
      wx.cloud.database().collection('post').doc(options.pid).get().then(res => {
        var temp = res.data.content
        if (temp[temp.length - 1][0] != 1) temp.push([1, ''])
        var picNum = 0
        for (let i = 0; i < res.data.content.length; ++i) {
          if (res.data.content[i][0] == 3) ++picNum
        }
        this.setData({
          fatherPost: Number(options.qid),
          pid: Number(options.pid),
          picn: picNum,
          tx: temp,
          pubTime: res.data.releaseTime,
          title: res.data.title,
          tag: res.data.tag,
          anonymity: res.data.anonymity,
          comment: res.data.comment,
          thumbs: res.data.thumbs,
        })
      })
    }
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
            wx.showToast({
              title: '上传失败',
              duration: 1000,
            })
          }
        })

      },
    })
  },

  delImage: function (e) {//仍有bug：不是删除最后一张时显示出错；数据库内未被删除
    var idx = Number(e.currentTarget.id)
    var temp = this.data.tx
    var imgPath = temp[idx][1]//合并，删数
    var act = this.data.activeTx
    console.log('??', idx, temp, imgPath)
    if (idx < temp.length - 1 && idx > 0) {//理论恒true
      if (temp[idx - 1][0] != 3 && temp[idx + 1][0] != 3) {//理论上必为true
        console.log('nr', temp[idx - 1][1], temp[idx + 1][1])
        if (temp[idx - 1][1] != '' && temp[idx + 1][1] != '') temp[idx - 1][1] += '\n' + temp[idx + 1][1]
        else if (temp[idx - 1][1] == '') temp[idx - 1][1] = temp[idx + 1][1]
        temp.splice(idx + 1, 1)
        if (act >= idx + 1) act -= 2
      }
    }

    temp.splice(idx, 1)
    console.log('sss', temp)
    this.setData({
      tx: temp,
      activeTx: act,
    })
    wx.cloud.deleteFile({
      fileList: ['postpic/' + imgPath],
      success: res => {
        console.log('fff', fileList)
        this.setData({
          tx: temp,
          activeTx: act,
        })
        wx.showToast({
          title: '删除成功，因网络延迟，稍等片刻后生效。',
          icon: 'none',
          duration: 1500,
        })
      },
      fail: res => {
        console.log('ffsdsdf', res)
        this.setData({
          tx: temp,
          activeTx: act,
        })
        wx.showToast({
          title: '删除失败',
          duration: 1500,
        })
      },
    })
  },

  /**
    * 生命周期函数--监听页面卸载
    */
  onUnload: function () {
    //暂时不设置保存进度，按下返回即删除所有进度
    if (!this.data.edit) {
      if (!this.data.pub) {
        wx.cloud.database().collection('global').doc('default').update({//取消发帖，回收帖子id
          data: {
            maxpid: wx.cloud.database().command.inc(-1)
          }
        }).then(res => { console.log('delete', res) })
      }
    }
  },

  selectTag: function (e) {
    this.setData({ tag: e.detail.value })
  },

  selectType: function (e) {
    this.setData({ type: Number(e.detail.value) })
  },

  switchAnonymity: function (e) {
    this.setData({ anonymity: e.detail.value })
  },

  switchCB: function (e) {
    this.setData({ anonymity: e.detail.value.includes('anonymity') })
  },

  inputText: function (e) {
    var temp = this.data.tx
    var idx = Number(e.currentTarget.id)
    if (idx < 0 || idx >= temp.length) {
      console.log('unknown bugs')
      return
    }
    temp[idx][1] = e.detail.value
    this.setData({
      tx: temp,
      activeTx: idx,
    })
  },

  inputTitle: function (e) {
    this.setData({ title: e.detail.value })
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
    if (this.data.title == '' && this.data.type) {
      wx.showToast({
        title: '请输入标题',
      })
      return
    }
    if (this.data.tag == '' && this.data.type) {
      wx.showToast({
        title: '请选择标签',
      })
      return
    }
    if (this.data.tx.length == 1 && this.data.tx[0][1] == '') {
      wx.showToast({
        title: '请输入正文',
      })
      return
    }
    //this.setData({ me: 1 })//调试
    this.setData({ busy: true })
    var thee = this
    wx.cloud.database().collection('user').doc(String(this.data.me)).get().then(res => {
      var fin = 0
      const finn = 4
      var nowTime = new Date()
      var nr = []
      var tagss = this.data.tags
      var release = this.data.edit ? this.data.pubTime : nowTime
      var fp = this.data.fatherPost
      var fty = 1
      if (this.data.edit && this.data.type) fp = 0
      for (let i = 0; i < tagss.length; ++i) {
        if (tagss[i][1] == this.data.tag) ++tagss[i][0]
      }
      for (let i = 0; i < this.data.tx.length; ++i) {
        if (this.data.tx[i][0] == 3 || this.data.tx[i][1] != '') nr.push(this.data.tx[i])
      }
      if (this.data.type) fty = this.data.type
      else fty = this.data.fatherType

      var datax = {
        id: this.data.pid,
        activeTime: nowTime,
        editTime: nowTime,
        releaseTime: release,
        tag: this.data.tag,
        comment: this.data.comment,
        thumbs: this.data.thumbs,
        type: this.data.type,
        reply: this.data.reply,
        anonymity: this.data.anonymity,
        user: this.data.me,//修复了发帖人不对应的BUG
        title: this.data.title,
        content: nr,
        hide: false,
        fatherPost: fp,
        fatherType: fty,
      }
      function succ() {
        thee.setData({
          pub: true,
          busy: false,
        })
        var fo = fp
        if (!fo) fo = thee.data.pid
        //console.log('wwc',thee.data.type, fo)
        if (!thee.data.type) {//是回帖 
          wx.cloud.database().collection('post').doc(String(fo)).get().then(ref => {
            var poster = ref.data.user
            console.log('succc', thee.data.me, poster)
            if (thee.data.me != poster) { //thee.data.me!=poster
              var replyType = thee.data.edit ? 2 : 1
              var po = thee.data.anonymity ? 0 : thee.data.me
              var io = [nowTime, false, replyType, fo, po, fo]
              wx.cloud.database().collection('user').doc(String(poster)).update({
                data: {
                  newInfo: wx.cloud.database().command.inc(1),
                  infos: wx.cloud.database().command.push([io])
                }
              }).catch(rwg => {
                console.log('修改消息提示失败！')
              })
            }
          }).catch(rwf => {
            console.log('读取原贴信息错误！')
          })
        }
        if (thee.data.reply) {
          wx.cloud.database().collection('post').doc(String(thee.data.reply)).get().then(ref => {
            var poster = ref.data.user
            console.log('succc', thee.data.me, poster)
            if (thee.data.me != poster) { //thee.data.me!=poster
              var replyType = thee.data.edit ? 2 : 1
              var po = thee.data.anonymity ? 0 : thee.data.me
              var io = [nowTime, false, replyType, thee.data.reply, po, fp]
              wx.cloud.database().collection('user').doc(String(poster)).update({
                data: {
                  newInfo: wx.cloud.database().command.inc(1),
                  infos: wx.cloud.database().command.push([io])
                }
              }).catch(rwg => {
                console.log('修改消息提示失败！(2)')
              })
            }
          }).catch(rwf => {
            console.log('读取原贴信息错误！')
          })
        }
        wx.navigateBack({})
        wx.showToast({
          title: (thee.data.edit ? '修改' : '发帖') + '成功！刷新后可以看到自己的帖子！',
          icon: 'none',
          duration: 3000,
        })
      }

      if (!this.data.type && !this.data.edit) {
        wx.cloud.database().collection('post').doc(String(this.data.fatherPost)).update({
          data: {
            comment: wx.cloud.database().command.push(this.data.pid),
            activeTime: nowTime,
          }
        }).then(rez => {
          //console.log('suc5', rez)
          if (++fin == finn) succ()
        })
      } else { if (++fin == finn) succ() }

      if (!this.data.edit) {
        datax['_id'] = String(this.data.pid)
        wx.cloud.database().collection('user').doc(String(this.data.me)).update({
          data: { publish: wx.cloud.database().command.push(this.data.pid) }
        }).then(rev => {
          //console.log('suc2', rev)
          if (++fin == finn) succ()
        })
        wx.cloud.database().collection('global').doc('catagory').update({
          data: { cat: tagss }
        }).then(rew => {
          //console.log('suc3', rew)
          if (++fin == finn) succ()
        })
        wx.cloud.database().collection('post').add({
          data: datax
        }).then(ret => {
          //console.log('suc', ret)
          if (++fin == finn) succ()
        })
      } else {
        if (!this.data.type) {
          wx.cloud.database().collection('post').doc(String(this.data.fatherPost)).update({
            data: { activeTime: nowTime, }
          }).then(rea => {
            //console.log('suc6', rea)
            if (++fin == finn) succ()
          })
        } else { if (++fin == finn) succ() }
        ++fin
        wx.cloud.database().collection('post').doc(String(this.data.pid)).update({
          data: datax
        }).then(rex => {
          //console.log('suc4', rex)
          if (++fin == finn) succ()
        })
      }

    }).catch(res => {
      wx.showToast({
        title: '发帖失败！',
        icon: 'none',
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