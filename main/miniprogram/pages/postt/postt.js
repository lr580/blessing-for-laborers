//帖子的主显示页面
// miniprogram/pages/postt/postt.js
var lr = require('../../lrfx.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {

    show: false,//与“我要回帖有关”
    focus: false,//与“我要回帖有关”
    postt:{},//正文帖子对象
    poster:{},//正文发帖人对象
    pathp:"cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/userpic/",//头像图片绝对路径一部分
    pathq:"default.jpg",//正文发帖人头像相对路径
    pathtp:"cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/postpic/",//帖子图片绝对路径一部分
    pdate:[],//正文最后活跃时间
    replys:0,//回帖数
    reply:[],//回帖的帖子(0)与用户(1)、头像地址(2)、被回复用户(3)、回帖时间(4)、被回复帖子(5)放在同一个(以数组实现结构体，便于结构体排序)
    replyer:[],//回帖回帖者
    rdate:[],
    me:0,//当前用户uid
    thumbBusy:false,//防止频繁点赞引发点赞数概率云
    images:{},
  },

  showPopup() {
    this.setData({ show: true });
  },

  onClose() {
    this.setData({ show: false });
  },

  bindButtonTap: function() {
    this.setData({
      focus: true
    })
  },
  bindTextAreaBlur: function(e) {
    console.log(e.detail.value)
  },
  bindFormSubmit: function(e) {
    console.log(e.detail.value.textarea)
  },//打印出输入框输入的内容



  imageLoad: function(e) {
    var $width=e.detail.width,    //获取图片真实宽度
        $height=e.detail.height,
        ratio=$width/$height;    //图片的真实宽高比例
    var viewWidth=718,           //设置图片显示宽度，左右留有16rpx边距
        viewHeight=718/ratio;    //计算的高度值
     var image=this.data.images; 
     //将图片的datadata-index作为image对象的key,然后存储图片的宽高值
     image[e.target.dataset.index]={
        width:viewWidth,
        height:viewHeight
     }
     this.setData({
          images:image
     })
 },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({me:getApp().globalData.userID})
    wx.cloud.database().collection('post').doc(options.id).get().then(res=>{
      this.setData({
        postt:res.data,
        pdate:[res.data.activeTime.getFullYear(),
          res.data.activeTime.getMonth()+1,
          res.data.activeTime.getDate(),
          res.data.activeTime.getHours(),
          res.data.activeTime.getMinutes(),
          res.data.activeTime.getSeconds()],
        replys:res.data.comment.length
      })
      wx.cloud.database().collection('user').doc(String(res.data.user)).get().then(ret=>{
        this.setData({
          poster:ret.data,
          pathq:ret.data.image
        })
      })
      if(res.data.comment.length)
      {
        var fin=0 //回帖的帖子加载完毕数
        var finu=0 //回帖的用户加载完毕数
        var temp=[] //帖子(0)与用户(1)、头像地址(2)、被回复用户(3)、回帖时间(4)、被回复帖子(5)放在同一个(以数组实现结构体，便于结构体排序)
        for(let i=0;i<res.data.comment.length;++i) temp[i]=[]

        //头像预设为默认头像
        var tempImageDir = [] 
        for(let i=0;i<res.data.comment.length;++i) temp[i][2]=this.data.pathq

        //按时间降序排序依据函数
        function cmp(){
          return function(a,b){
            return b[0]['editTime']-a[0]['editTime']
          }
        }

        //获取所有回帖
        for(let i=0;i<res.data.comment.length;++i)
        {
          wx.cloud.database().collection('post').doc(String(res.data.comment[i])).get().then(reu=>{
            wx.cloud.database().collection('user').doc(String(reu.data.user)).get().then(rev=>{
              ++fin
              temp[i][1]=rev.data
              temp[i][2]=rev.data.image
              if(fin==res.data.comment.length*4) {//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕
                temp.sort(cmp())
                this.setData({
                  reply:temp,
                  replys:res.data.comment.length
                })
              }
            })
            if(reu.data.reply)
            {
              wx.cloud.database().collection('post').doc(String(reu.data.reply)).get().then(rex=>{
                wx.cloud.database().collection('user').doc(String(rex.data.user)).get().then(rew=>{
                  ++fin
                  temp[i][3]=rew.data
                  if(fin==res.data.comment.length*4) {//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕
                    temp.sort(cmp())
                    this.setData({
                      reply:temp,
                      replys:res.data.comment.length
                    })
                  }
                })
                ++fin
                temp[i][5]=rex.data
                if(fin==res.data.comment.length*4) {//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕
                  temp.sort(cmp())
                  this.setData({
                    reply:temp,
                    replys:res.data.comment.length
                  })
                }
              })
            }
            else fin+=2

            ++fin
            temp[i][0]=reu.data
            temp[i][4]=[
              reu.data.editTime.getFullYear(),
              reu.data.editTime.getMonth()+1,
              reu.data.editTime.getDate(),
              reu.data.editTime.getHours(),
              reu.data.editTime.getMinutes(),
              reu.data.editTime.getSeconds()
            ]
            if(fin==res.data.comment.length*4){//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕(实验表明不会在这里结束异步，但保险起见还是放着吧)
              temp.sort(cmp())
              this.setData({
                reply:temp,
                replys:res.data.comment.length
              })
            }
          })
        }
      }
    })
    
  },

  thumbize:function(e){
    var u=this.data.me//点赞者uid，即me
    var pid=Number(e.currentTarget.id) //被点赞帖子id
    var pii=-1 //若是回帖，被点赞帖子的下标，若不是，为-1
    var p={}//被点赞的帖子对象
    if(pid==this.data.postt.id) p=this.data.postt
    else for(let i=0;i<this.data.reply.length;++i) if(pid==this.data.reply[i][0].id)
    {
      p=this.data.reply[i][0]
      pii=i
    }

    if(p=={})
    {
      wx.showToast({
        title: '系统错误：该帖子不存在！',
        icon:'none',
        duration: 1500,
      })
      return
    }
    if(this.data.thumbBusy)
    {
      wx.showToast({
        title: '您点赞的频率过快，请稍后再操作',
        icon:'none',
        duration: 1500,
      })
      return
    }
    if(u==p.user)
    {
      wx.showToast({
        title: '您不能给自己点赞',
        icon:'none',
        duration: 1500,
      })
      return
    }

    this.setData({thumbBusy:true})
    wx.cloud.database().collection('user').doc(String(u)).get().then(res=>{
      var thumbLen = res.data.thumbs.length
      var find = false
      for(let i=0;i<thumbLen;++i)
      {
        if(pid==res.data.thumbs[i])
        {
          find=true
          var t2=[]
          for(let j=0;j<thumbLen;++j) if(pid!=res.data.thumbs[j]) t2.push(res.data.thumbs[j])

          wx.cloud.database().collection('user').doc(String(u)).update({
            data:{
              thumbs:t2
            }
          }).then(res=>{
            wx.cloud.database().collection('post').doc(String(pid)).update({
              data:{
                thumbs:wx.cloud.database().command.inc(-1)
              }
            }).then(ret=>{
              var temp = this.data.postt
              var temr = this.data.reply
              if(pii==-1) --temp.thumbs
              else --temr[pii][0].thumbs
              this.setData({
                postt:temp,
                reply:temr,
                thumbBusy:false,
              })
              wx.showToast({
                title:"取消点赞成功",
                duration:1500,
              })
            })
          })
        }
      }
      if(!find)
      {
        wx.cloud.database().collection('user').doc(String(u)).update({
          data:{
            thumbs:wx.cloud.database().command.push(pid)
          }
        }).then(res=>{
          wx.cloud.database().collection('post').doc(String(pid)).update({
            data:{
              thumbs:wx.cloud.database().command.inc(1)
            }
          }).then(ret=>{
            wx.showToast({
              title:"点赞成功",
              duration:1500,
            })
            var temp = this.data.postt
            var temr = this.data.reply
            if(pii==-1) ++temp.thumbs
            else ++temr[pii][0].thumbs
            this.setData({
              postt:temp,
              reply:temr,
              thumbBusy:false,
            })
            this.setData({
              postt:temp,
              thumbBusy:false,
            })
          })
        })
      }
    })
  },

  replyize:function(e){
    var u=this.data.me
    var pid=Number(e.currentTarget.id)
    console.log('回帖',u,pid)
  },

  editPost:function(e){
    var u=this.data.me
    var pid=Number(e.currentTarget.id)
    console.log('编辑',u,pid)
  },

  delPost:function(e){
    var u=this.data.me
    var pid=Number(e.currentTarget.id)
    console.log('删除',u,pid)
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
//lr.lr581()
