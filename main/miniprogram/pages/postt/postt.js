//帖子的主显示页面
// miniprogram/pages/postt/postt.js
var lr = require('../../lrfx.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postt:{},//正文帖子对象
    poster:{},//正文发帖人对象
    pathp:"cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/userpic/",//头像图片绝对路径一部分
    pathq:"default.jpg",//正文发帖人头像相对路径
    pathtp:"cloud://scnuyjx-7gmvlqwfe64c446a.7363-scnuyjx-7gmvlqwfe64c446a-1304878008/postpic/",//帖子图片绝对路径一部分
    pdate:[],//正文最后活跃时间
    replys:0,//回帖数
    Treplys:0,//未被删除的回帖数
    reply:[],//回帖的帖子(0)与用户(1)、头像地址(2)、被回复用户(3)、回帖时间(4)、被回复帖子(5)、是否被点赞(6)放在同一个(以数组实现结构体，便于结构体排序)
    replyer:[],//回帖回帖者
    rdate:[],
    me:0,//当前用户uid
    meo:{},//当前用户对象
    thumbpost:false,//是否点赞了主贴
    starpost:false,//是否收藏了主贴
    thumbBusy:false,//防止频繁点赞引发点赞数概率云
    starBusy:false,//同上理，收藏
    delBusy:false,//同上，删帖
    show: false,//与“我要回帖有关”
    focus: false,//与“我要回帖有关”
    images:{},//?
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
    /*wx.cloud.database().collection('post').doc('-1').get({
      fail:ret=>{
        console.log('not found',ret)
      },
      success:ret=>{
        console.log('nani')
      }
    })*/
    /*var suca=0
    for(let i=3;i<=65;++i){
      wx.cloud.database().collection('post').doc(String(i)).update({
        data:{hide:false}
      }).then(res=>{console.log(i,++suca)})
    }*/

    this.setData({me:getApp().globalData.userID})
    wx.cloud.database().collection('user').doc(String(this.data.me)).get().then(rer=>{
      this.setData({
        meo:rer.data,
        thumbpost:rer.data.thumbs.includes(Number(options.id)),
        starpost:rer.data.collect.includes(Number(options.id)),
      })
    })
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
        var temp=[] //见reply
        var tlen=0 //未被删除有效帖子数
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
                  replys:res.data.comment.length,
                  Treplys:tlen,
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
                      replys:res.data.comment.length,
                      Treplys:tlen,
                    })
                  }
                })
                ++fin
                temp[i][5]=rex.data
                if(fin==res.data.comment.length*4) {//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕
                  temp.sort(cmp())
                  this.setData({
                    reply:temp,
                    replys:res.data.comment.length,
                    Treplys:tlen,
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
            temp[i][6]=this.data.meo.thumbs.includes(temp[i][0].id)
            if(!temp[i][0].hide) ++tlen
            if(fin==res.data.comment.length*4){//异步的某一次全部回帖帖子和回帖用户和嵌套用户均加载完毕(实验表明不会在这里结束异步，但保险起见还是放着吧)
              temp.sort(cmp())
              this.setData({
                reply:temp,
                replys:res.data.comment.length,
                Treplys:tlen,
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

          this.setData({'meo.thumbs':t2})
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
              if(pii==-1)
              {
                --temp.thumbs
                this.setData({thumbpost:false})
              }
              else {
                --temr[pii][0].thumbs
                temr[pii][6]=false
              }
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
            var tems = this.data.meo.thumbs
            //console.log('??????????',tems)
            tems.push(pid)

            //if(pii==-1) ++temp.thumbs
            //else ++temr[pii][0].thumbs

            if(pii==-1)
              {
                ++temp.thumbs
                this.setData({thumbpost:true})
              }
              else {
                ++temr[pii][0].thumbs
                temr[pii][6]=true
              }
            this.setData({
              postt:temp,
              reply:temr,
              thumbBusy:false,
              'meo.thumbs':tems,
            })
          })
        })
      }
    })
  },

  replyize:function(e){//自己可以回复自己的帖子或回帖
    var u=this.data.me
    var pid=this.data.postt.id//主贴
    var cid=Number(e.currentTarget.id)//嵌套回帖
    var reply=0
    var rp=this.data.postt.title
    var rr=''
    console.log(this.data.reply)
    if(cid!=this.data.postt.id) for(let i=0;i<this.data.reply.length;++i) if(cid==this.data.reply[i][0].id){
      reply=this.data.reply[i][0].id
      if(this.data.reply[i][0].anonymity&&this.data.me!=this.data.reply[i][0].user) rr='匿名用户'
      else rr=this.data.reply[i][1].nickName
    }
    wx.navigateTo({
      url: '../postp/postp?reply='+String(reply)+'&type=0&edit=false&pid='+String(pid)+'&rp='+rp+'&rr='+rr,
    })
  },

  editPost:function(e){
    var u=this.data.me
    var pid=Number(e.currentTarget.id)
    var ty=1
    if(pid==this.data.postt.id) ty=this.data.postt.type
    else for(let i=0;i<this.data.reply.length;++i) if(pid==this.data.reply[i][0].id) ty=this.data.reply[i][0].type
    wx.navigateTo({
      url: '../postp/postp?reply=0&type='+String(ty)+'&pid='+String(pid)+'&edit=true',
    })
  },

  delPost:function(e){
    var u=this.data.me
    var pid=Number(e.currentTarget.id)
    wx.cloud.database().collection('post').doc(String(pid)).update({
      data:{hide:true}
    }).then(res=>{
      if(pid==this.data.postt.id) wx.navigateBack({})
      wx.showToast({
        title: '删帖成功，刷新后不再看到自己的帖子/回帖！',
        icon:'none',
        duration:1500,
      })
    })
  },

  starPost:function(e){//自己可以收藏自己的帖子
    if(this.data.starBusy){
      wx.showToast({
        title: '请勿频繁操作',
        duration:1500,
      })
    }
    this.setData({starBusy:true})
    var u=this.data.me
    var pid=this.data.postt.id
    var col=this.data.meo.collect
    var dol=[]
    if(this.data.starpost){//取消收藏
      for(let i=0;i<col.length;++i) if(col[i]!=pid) dol.push(col[i])
    } else { //收藏
      dol=col
      dol.push(pid)
    }
    wx.cloud.database().collection('user').doc(String(u)).update({
      data:{collect:dol}
    }).then(res=>{
      wx.showToast({
        title: (this.data.starpost?'取消':'')+'收藏成功',
        duration:1500,
      })
      this.setData({
        starpost:!this.data.starpost,
        'meo.collect':dol,
        starBusy:false,
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
