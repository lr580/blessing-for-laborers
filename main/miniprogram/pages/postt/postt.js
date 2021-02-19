const { fakeUser, fakePost } = require('../../lrfx.js');
//帖子的主显示页面
const lrfx = require('../../lrfx.js')
var lr = require('../../lrfx.js')
var app = getApp();
const db = wx.cloud.database()
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgKey: true,//前端使用
    postt: {},//正文帖子对象
    poster: {},//正文发帖人对象
    pathp: "cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/userpic/",//头像图片绝对路径一部分
    pathq: "default.jpg",//正文发帖人头像相对路径
    pathtp: "cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/postpic/",//帖子图片绝对路径一部分
    pdate: [],//正文最后活跃时间
    replys: 0,//回帖数
    Treplys: 0,//未被删除的回帖数
    reply: [],//回帖的帖子(0)与用户(1)、头像地址(2)、被回复用户(3)、回帖时间(4)、被回复帖子(5)、是否被点赞(6)放在同一个(以数组实现结构体，便于结构体排序)
    replyer: [],//回帖回帖者(废置)
    rdate: [],
    me: app.globalData.OpenId,//当前用户uid
    meo: {},//当前用户对象
    thumbpost: false,//是否点赞了主贴
    starpost: false,//是否收藏了主贴
    thumbBusy: false,//防止频繁点赞引发点赞数概率云
    starBusy: false,//同上理，收藏
    delBusy: false,//同上，删帖
    show: false,//与“我要回帖有关”
    focus: false,//与“我要回帖有关”
    images: {},//?
    unfresh: false,//有待刷新
    opt: [],//页面加载传入的信息
    descTime: true,//是否按发表时间降序排序回帖
    collectTitle: null,
    collectTag: null,
    collectUser: null
  },

  showPopup() {
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  bindButtonTap: function () {
    this.setData({
      focus: true
    })
  },
  bindTextAreaBlur: function (e) {
    console.log(e.detail.value)
  },
  bindFormSubmit: function (e) {
    console.log(e.detail.value.textarea)
  },//打印出输入框输入的内容
  imageLoad: function (e) {
    var $width = e.detail.width,    //获取图片真实宽度
      $height = e.detail.height,
      ratio = $width / $height;    //图片的真实宽高比例
    var viewWidth = 718,           //设置图片显示宽度，左右留有16rpx边距
      viewHeight = 718 / ratio;    //计算的高度值
    var image = this.data.images;
    //将图片的datadata-index作为image对象的key,然后存储图片的宽高值
    image[e.target.dataset.index] = {
      width: viewWidth,
      height: viewHeight
    }
    this.setData({
      images: image
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      me: getApp().globalData.userID,
      pathp: getApp().globalData.pathp,
      pathtp: getApp().globalData.pathtp,
      opt: options,
    })
    wx.cloud.database().collection('user').doc(String(this.data.me)).get().then(rer => {
      this.setData({
        meo: rer.data,
        thumbpost: rer.data.thumbs.includes(Number(options.id)),
        starpost: rer.data.collect.includes(Number(options.id)),
      })
    }).catch(rwr => {
      //未写未登录状态
      wx.showToast({
        title: '账号信息异常！',
      })
      console.log('?')
    })
    wx.cloud.database().collection('post').doc(options.id).get().then(res => {
      this.setData({
        postt: res.data,
        pdate: lrfx.dateArr(res.data.editTime),
        /*pdate: [res.data.editTime.getFullYear(),//将正贴时间从最后活跃时间改成了编辑时间
        res.data.editTime.getMonth() + 1,
        res.data.editTime.getDate(),
        res.data.editTime.getHours(),
        res.data.editTime.getMinutes(),
        res.data.editTime.getSeconds()],*/
        replys: res.data.comment.length
      })
      wx.cloud.database().collection('user').doc(String(res.data.user)).get().then(ret => {
        this.browse()
        this.setData({
          poster: ret.data,
          pathq: ret.data.image
        })
      }).catch(rwt => {
        this.setData({
          poster: lrfx.fakeUser,
          //pathq:'dafault.jpg',
        })
      })
      if (res.data.comment.length) {
        var fin = 0 //回帖的帖子加载完毕数
        var temp = [] //见reply
        var tlen = 0 //未被删除有效帖子数
        for (let i = 0; i < res.data.comment.length; ++i) temp[i] = []
        const thee = this
        function succ() {
          temp.sort(cmp())
          thee.setData({
            reply: temp,
            replys: res.data.comment.length,
            Treplys: tlen,
          })
        }

        //头像预设为默认头像
        for (let i = 0; i < res.data.comment.length; ++i) temp[i][2] = this.data.pathq
        //var thee = this
        //按发布时间降序排序依据函数
        function cmp() {
          if (thee.data.descTime) {
            return function (a, b) {
              return b[0]['releaseTime'] - a[0]['releaseTime']
            }
          } else {
            return function (a, b) {
              return a[0]['releaseTime'] - b[0]['releaseTime']
            }
          }
        }
        function cmp2() {
          if (thee.data.descTime) {
            return function (a, b) {
              return b['releaseTime'] - a['releaseTime']
            }
          } else {
            return function (a, b) {
              return a['releaseTime'] - b['releaseTime']
            }
          }
        }
        var reply = []
        var cmt = res.data.comment

        var thew = this
        var tuser = []
        var tpost = []
        var ruser = []//r开头是id列表，t开头是对象列表
        //var rpost = []

        var tuser2 = []
        var tpost2 = []
        var ruser2 = []
        var rpost2 = []
        var nfin = 0
        const ex = 20
        var ntot = Math.ceil(cmt.length / ex)
        function succc() {
          tpost.sort(cmp2())
          for (let i = 0; i < tpost.length; ++i) {
            //console.log('a',i) sad debug
            reply[i] = []
            reply[i][0] = tpost[i]
            reply[i][1] = String(tpost[i].user)
            ruser.push(String(tpost[i].user))
            reply[i][4] = lrfx.dateArr(tpost[i].editTime)
            reply[i][6] = thew.data.meo.thumbs.includes(tpost[i].id)
            reply[i][5] = tpost[i].reply
            if (reply[i][5]) rpost2.push(String(tpost[i].reply))
          }
          ruser = Array.from(new Set(ruser))
          rpost2 = Array.from(new Set(rpost2))

          var rut = Math.ceil(ruser.length / ex)
          var rp2t = Math.ceil(rpost2.length / ex)
          var mlen = rut + rp2t
          var mfin = 0

          //console.log('succc',reply)
          function succd() {
            //console.log('qwqq', tuser, tpost2)
            for (let i = 0; i < reply.length; ++i) {
              for (let j = 0; j < tuser.length; ++j) {
                if (reply[i][1] == tuser[j]._id) {
                  reply[i][1] = tuser[j]
                  reply[i][2] = tuser[j].image
                  break
                }
              }
              if (reply[i][5] != 0) for (let j = 0; j < tpost2.length; ++j) {
                if (String(reply[i][5]) == tpost2[j]._id) {
                  reply[i][5] = tpost2[j]
                  reply[i][3] = String(tpost2[j].user)
                  ruser2.push(String(tpost2[j].user))
                  break
                }
              }
            }
            ruser2 = Array.from(new Set(ruser2))
            var lfin = 0
            var llen = Math.ceil(ruser2.length / ex)
            function succe() {
              //console.log(tuser2)
              for (let i = 0; i < reply.length; ++i) {
                if (reply[i][5] != 0) {
                  for (let j = 0; j < tuser2.length; ++j) {
                    if (reply[i][3] == tuser2[j]._id) {
                      reply[i][3] = tuser2[j]
                      break
                    }
                  }
                }
              }
              //console.log('好耶！', reply)
              var tr = 0
              for (let i = 0; i < reply.length; ++i) if (!reply[i][0].hide) ++tr
              thew.setData({
                reply: reply,
                replys: reply.length,
                Treplys: tr,
              })
            }
            if(!llen) succe()
            for (let i = 0; i < llen; ++i) {
              var temp = []
              var jrf = Math.min((i + 1) * ex, ruser2.length)
              for (let j = i * ex; j < jrf; ++j) temp.push(ruser2[j])
              db.collection('user').where({ _id: _.in(temp) }).get().then(rek => {
                tuser2 = tuser2.concat(rek.data)
                if (++lfin == llen) succe()
              }).catch(rwk => {
                wx.showToast({
                  title: '获取回帖嵌套用户失败！(批次' + String(i + 1) + ')',
                  icon: 'none',
                })
              })
            }
            //console.log(reply, ruser2)
          }
          if (!mlen) succd() //理论上该if永假
          for (let i = 0; i < rut; ++i) {
            var temp = []
            var jrf = Math.min((i + 1) * ex, ruser.length)
            for (let j = i * ex; j < jrf; ++j) temp.push(ruser[j])

            db.collection('user').where({ _id: _.in(temp) }).get().then(rei => {
              tuser = tuser.concat(rei.data)
              if (++mfin == mlen) succd()
            }).catch(rwi => {
              wx.showToast({
                title: '获取回帖嵌套失败！(批次' + String(i + 1) + ')',
                icon: 'none',
              })
            })
          }
          for (let i = 0; i < rut; ++i) {
            var temp = []
            var jrf = Math.min((i + 1) * ex, rpost2.length)
            for (let j = i * ex; j < jrf; ++j) temp.push(rpost2[j])
            db.collection('post').where({ _id: _.in(temp) }).get().then(rej => {
              tpost2 = tpost2.concat(rej.data)
              if (++mfin == mlen) succd()
            }).catch(rwj => {
              wx.showToast({
                title: '获取回帖用户失败！(批次' + String(i + 1) + ')',
                icon: 'none',
              })
            })
          }
        }
        //if(!ntot) 
        //console.log('ntot', ntot)
        for (let i = 0; i < ntot; ++i) {
          var temp = []
          var jrf = Math.min((i + 1) * ex, cmt.length)
          for (let j = i * ex; j < jrf; ++j) temp.push(String(cmt[j]))
          //temp=Array.from(new Set(temp)) 本来就唯一性，不必unique()了
          db.collection('post').where({ _id: _.in(temp) }).get().then(reh => {
            tpost = tpost.concat(reh.data)
            if (++nfin == ntot) succc()
          }).catch(rwh => {
            wx.showToast({
              title: '获取回帖失败！(批次' + String(i + 1) + ')',
              icon: 'none',
            })
          })
        }
        //获取所有回帖
        /*for (let i = 0; i < res.data.comment.length; ++i) {
          wx.cloud.database().collection('post').doc(String(res.data.comment[i])).get().then(reu => {
            wx.cloud.database().collection('user').doc(String(reu.data.user)).get().then(rev => {
              ++fin
              temp[i][1] = rev.data
              temp[i][2] = rev.data.image
              if (fin == res.data.comment.length * 4) {//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕
                temp.sort(cmp())
                this.setData({
                  reply: temp,
                  replys: res.data.comment.length,
                  Treplys: tlen,
                })
              }
            }).catch(rwv => {
              temp[i][1] = lrfx.fakeUser
              temp[i][2] = 'default.jpg'
              ++fin
              if (fin == res.data.comment.length * 4) {//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕
                temp.sort(cmp())
                this.setData({
                  reply: temp,
                  replys: res.data.comment.length,
                  Treplys: tlen,
                })
              }
            })
            if (reu.data.reply) {
              wx.cloud.database().collection('post').doc(String(reu.data.reply)).get().then(rex => {
                wx.cloud.database().collection('user').doc(String(rex.data.user)).get().then(rew => {
                  ++fin
                  temp[i][3] = rew.data
                  if (fin == res.data.comment.length * 4) {//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕
                    temp.sort(cmp())
                    this.setData({
                      reply: temp,
                      replys: res.data.comment.length,
                      Treplys: tlen,
                    })
                  }
                }).catch(rww => {
                  ++fin
                  temp[i][3] = lrfx.fakeUser
                  if (fin == res.data.comment.length * 4) {//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕
                    temp.sort(cmp())
                    this.setData({
                      reply: temp,
                      replys: res.data.comment.length,
                      Treplys: tlen,
                    })
                  }
                })
                ++fin
                temp[i][5] = rex.data
                if (fin == res.data.comment.length * 4) {//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕
                  temp.sort(cmp())
                  this.setData({
                    reply: temp,
                    replys: res.data.comment.length,
                    Treplys: tlen,
                  })
                }
              }).catch(rwx => {
                fin += 2
                temp[i][3] = fakeUser
                temp[i][5] = fakePost
                if (fin == res.data.comment.length * 4) {//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕
                  temp.sort(cmp())
                  this.setData({
                    reply: temp,
                    replys: res.data.comment.length,
                    Treplys: tlen,
                  })
                }
              })
            }
            else fin += 2

            ++fin
            temp[i][0] = reu.data
            temp[i][4] = lrfx.dateArr(reu.data.editTime)
            temp[i][6] = this.data.meo.thumbs.includes(temp[i][0].id)
            if (!temp[i][0].hide) ++tlen
            if (fin == res.data.comment.length * 4) {//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕(实验表明不会在这里结束异步，但保险起见还是放着吧)
              temp.sort(cmp())
              this.setData({
                reply: temp,
                replys: res.data.comment.length,
                Treplys: tlen,
              })
            }
          }).catch(rwu => {//?
            var tmp = []
            tmp[0] = lrfx.fakePost
            tmp[1] = lrfx.fakeUser
            tmp[2] = 'default.jpg'
            tmp[3] = lrfx.fakeUser
            tmp[4] = new Date()
            tmp[5] = lrfx.fakePost
            tmp[6] = false
            temp[i] = tmp
            fin += 4
            if (fin == res.data.comment.length * 4) {
              temp.sort(cmp())
              this.setData({
                reply: temp,
                replys: res.data.comment.length,
                Treplys: tlen,
              })
            }
          })
        }*/
      }
    }).catch(rwr => {
      //var p = { hide: true }//模拟删帖
      var pt = lrfx.fakePost
      var pr = lrfx.fakeUser
      this.setData({
        postt: pt,
        poster: pr,
        //pathq: 'default.jpg',
      })
    })
  },

  browse: function () {
    const cc = wx.cloud.database().collection('user')
    cc.doc(String(this.data.me)).get().then(res => {
      var log = res.data.browseLog
      var dat = new Date()
      var found = false
      for (let i = 0; i < log.length; ++i) {
        if (log[i][0] == this.data.postt.id) {
          log[i] = [log[i][0], dat, log[i][2]]
          found = true
        }
        else log[i] = [log[i][0], new Date(log[i][1]["$date"]), log[i][2]]//解决微信数据库读取会让date转object的bug
      }
      if (!found) log.push([this.data.postt.id, dat, this.data.poster._id])
      cc.doc(String(this.data.me)).update({ data: { browseLog: log } }).then(ret => {
      }).catch(rwt => {
        wx.showToast({
          title: '写入用户信息异常！',
          icon: 'none',
        })
      })
    }).catch(rws => {
      wx.showToast({
        title: '读取用户信息异常！',
        icon: 'none',
      })
    })
  },

  thumbize: function (e) {
    var u = this.data.me//点赞者uid，即me
    var pid = Number(e.currentTarget.id) //被点赞帖子id
    var pii = -1 //若是回帖，被点赞帖子的下标，若不是，为-1
    var p = {}//被点赞的帖子对象
    if (pid == this.data.postt.id) p = this.data.postt
    else for (let i = 0; i < this.data.reply.length; ++i) if (pid == this.data.reply[i][0].id) {
      p = this.data.reply[i][0]
      pii = i
    }

    if (p == {}) {
      wx.showToast({
        title: '系统错误：该帖子不存在！',
        icon: 'none',
        duration: 1500,
      })
      return
    }
    if (this.data.thumbBusy) {
      wx.showToast({
        title: '您点赞的频率过快，请稍后再操作',
        icon: 'none',
        duration: 1500,
      })
      return
    }
    if (u == p.user) {
      wx.showToast({
        title: '您不能给自己点赞',
        icon: 'none',
        duration: 1500,
      })
      return
    }

    this.setData({ thumbBusy: true })
    wx.cloud.database().collection('user').doc(String(u)).get().then(res => {
      var thumbLen = res.data.thumbs.length
      var find = false
      for (let i = 0; i < thumbLen; ++i) {
        if (pid == res.data.thumbs[i]) {
          find = true
          var t2 = []
          for (let j = 0; j < thumbLen; ++j) if (pid != res.data.thumbs[j]) t2.push(res.data.thumbs[j])

          this.setData({ 'meo.thumbs': t2 })
          wx.cloud.database().collection('user').doc(String(u)).update({
            data: {
              thumbs: t2
            }
          }).then(res => {
            wx.cloud.database().collection('post').doc(String(pid)).update({
              data: {
                thumbs: wx.cloud.database().command.inc(-1)
              }
            }).then(ret => {
              var temp = this.data.postt
              var temr = this.data.reply
              if (pii == -1) {
                --temp.thumbs
                this.setData({ thumbpost: false })
              }
              else {
                --temr[pii][0].thumbs
                temr[pii][6] = false
              }
              this.setData({
                postt: temp,
                reply: temr,
                thumbBusy: false,
              })
              wx.showToast({
                title: "取消点赞成功",
                duration: 1500,
              })
            })
          })
        }
      }
      if (!find) {
        wx.cloud.database().collection('user').doc(String(u)).update({
          data: {
            thumbs: wx.cloud.database().command.push(pid)
          }
        }).then(res => {
          wx.cloud.database().collection('post').doc(String(pid)).update({
            data: {
              thumbs: wx.cloud.database().command.inc(1)
            }
          }).then(ret => {
            wx.showToast({
              title: "点赞成功",
              duration: 1500,
            })
            var temp = this.data.postt
            var temr = this.data.reply
            var tems = this.data.meo.thumbs
            tems.push(pid)

            if (pii == -1) {
              ++temp.thumbs
              this.setData({ thumbpost: true })
            }
            else {
              ++temr[pii][0].thumbs
              temr[pii][6] = true
            }
            this.setData({
              postt: temp,
              reply: temr,
              thumbBusy: false,
              'meo.thumbs': tems,
            })
          })
        })
      }
    })
  },

  replyize: function (e) {//自己可以回复自己的帖子或回帖
    var u = this.data.me
    var pid = this.data.postt.id//主贴
    var cid = Number(e.currentTarget.id)//嵌套回帖
    var reply = 0
    var rp = this.data.postt.title
    var rr = ''
    var fty = this.data.postt.type
    if (cid != this.data.postt.id) for (let i = 0; i < this.data.reply.length; ++i) if (cid == this.data.reply[i][0].id) {
      reply = this.data.reply[i][0].id
      if (this.data.reply[i][0].anonymity && this.data.me != this.data.reply[i][0].user) rr = '匿名用户'
      else rr = this.data.reply[i][1].nickName
    }
    wx.navigateTo({
      url: '../postp/postp?reply=' + String(reply) + '&type=0&edit=false&pid=' + String(pid) + '&rp=' + rp + '&rr=' + rr + '&fty=' + fty,
    })
    this.setData({ unfresh: true })
  },

  editPost: function (e) {
    var u = this.data.me
    var pid = Number(e.currentTarget.id)
    var cid = pid
    var qid = String(this.data.postt.id)
    var reply = 0
    var ty = 1
    var rp = this.data.postt.title
    var rr = ''
    if (cid != this.data.postt.id) for (let i = 0; i < this.data.reply.length; ++i) if (cid == this.data.reply[i][0].id) {
      if (this.data.reply[i][5] == undefined) continue
      reply = this.data.reply[i][5].id
      if (this.data.reply[i][5].anonymity && this.data.me != this.data.reply[i][5].user) rr = '匿名用户'
      else rr = this.data.reply[i][3].nickName
    }

    if (pid == this.data.postt.id) ty = this.data.postt.type
    else for (let i = 0; i < this.data.reply.length; ++i) if (pid == this.data.reply[i][0].id) ty = this.data.reply[i][0].type
    wx.navigateTo({
      url: '../postp/postp?reply=' + String(reply) + '&type=' + String(ty) + '&pid=' + String(pid) + '&edit=true&rp=' + rp + '&rr=' + rr + '&qid=' + qid,
    })
    this.setData({ unfresh: true })
    this.onShow()
  },

  delPost: function (e) {
    var u = this.data.me
    var pid = Number(e.currentTarget.id)
    var thee = this
    wx.showModal({
      cancelColor: 'cancelColor',
      title: '提示',
      content: '确认删除吗？',
      success(res) {
        if (res.confirm) {
          wx.cloud.database().collection('post').doc(String(pid)).update({
            data: { hide: true }
          }).then(res => {
            if (pid == thee.data.postt.id) {
              var tagg = thee.data.postt.tag
              wx.cloud.database().collection('global').doc('catagory').get().then(rea => {
                var ca = rea.data.cat
                for (let i = 0; i < ca.length; ++i) if (ca[i][1] == tagg) {
                  --ca[i][0]
                  break
                }
                wx.cloud.database().collection('global').doc('catagory').update({
                  data: { cat: ca }
                }).then(reb => { })
              })
              wx.navigateBack({})
            }
            else {
              thee.setData({ unfresh: true })
              thee.onShow()
            }
            wx.showToast({
              title: '删帖成功！',
              icon: 'none',
              duration: 1500,
            })
          })
        }
      }
    })
  },

  starPost: async function (e) {//自己可以收藏自己的帖子
    if (this.data.starBusy) {
      wx.showToast({
        title: '请勿频繁操作',
        duration: 1500,
      })
    }
    this.setData({ starBusy: true })
    var u = this.data.me
    var pid = this.data.postt.id
    var col = this.data.meo.collect
    var dol = []
    var tag
    var user
    var title
    if (this.data.starpost) {//取消收藏
      for (let i = 0; i < col.length; ++i) if (col[i] != pid) dol.push(col[i])
    } else { //收藏

      // var res=await db.collection("post").doc(String(pid)).get().then(res=>{
      //   tag=res.data.tag
      //   title=res.data.title
      //   user=res.data.user
      // })
      //   var res =await db.collection("user").doc(user).get().then(res=>{
      //     user=res.data.nickName
      //   })
      // console.log(tag+"   "+title+"   "+user)
      dol = col
      dol.push(pid)
    }


    wx.cloud.database().collection('user').doc(String(u)).update({
      data: { collect: dol }
    }).then(res => {
      wx.showToast({
        title: (this.data.starpost ? '取消' : '') + '收藏成功',
        duration: 1500,
      })
      this.setData({
        starpost: !this.data.starpost,
        'meo.collect': dol,
        starBusy: false,
      })
    })
  },

  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    var fr = this.data.unfresh
    if (fr) {
      this.onLoad(this.data.opt)
    }
  },

  selectST: function (e) {
    this.setData({
      descTime: e.detail.value,
      unfresh: true,
    })
    this.onShow()
  },

  bigPicture: function (e) {
    var et = e.target.id.split(',')
    var pid = Number(et[0])
    var iid = Number(et[1])
    var imgs = []
    var nr
    var cimg = ''
    //console.log(pid,iid)
    if (!pid)
      nr = this.data.postt.content
    else nr = this.data.reply[pid - 1][0].content
    //console.log(nr)
    for (let i = 0; i < nr.length; ++i) {
      if (nr[i][0] == 3) {
        imgs.push(this.data.pathtp + nr[i][1])
        if (i == iid) cimg = this.data.pathtp + nr[i][1]
      }
    }
    //console.log(cimg, imgs)
    wx.previewImage({
      urls: imgs,
      current: cimg,
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
//lr.lr581()
