//lr580 function provide
function lr581()//用以测试该模块是否加载成功
{
  //在pages里的js尝试如下调用，测试是否成功加载该模块：
  //var modu = require('../../lrfx.js')
  //modu.lr581()
  console.log('successfully got lrfx.js')
}

function thumbz(u,p){ //用户(id)u给帖子(uid)p点赞，返回是否成功
  wx.cloud.database().collection('user').doc(String(u)).get().then(res=>{
    var thumbLen = res.data.thumbs.length
    for(let i=0;i<thumbLen;++i)
    {
      if(p==res.data.thumbs[i])
      {
        console.log('已经点赞')
        
      }
    }
  })
}

function logPost() {

}

//暂用，以后可以由其他函数替代
function loadPost(uid) {
  /*//wx.cloud.init({env:'scnuyjx-7gmvlqwfe64c446a'})
  
  //exports.main = async (event,context) => {
  //  var po = {}
  //  wx.cloud.database().collection('post').doc(uid).get().then(res =>{
      //console.log(typeof res.data)
  //    for(let k in res.data) po[k]=res.data[k]//,console.log(res.data[k])
  //  })
  //getApp().globalData.tempO = po
  //}*/
  //假设我调用某个函数得到了这个对象
  return   {
    "_id": "1",
    "activeTime": "2021-01-30T07:31:01.000Z",
    "comment": [],
    "content": [
      [
        1,
        "想问一道微积分的题"
      ],
      [
        2,
        "很难"
      ],
      [
        3,
        "server-icon2.png"
      ]
    ],
    "editTime": "2021-01-30T07:31:01.000Z",
    "id": 1,
    "releaseTime": "2021-01-30T07:31:01.713Z",
    "tag": "微积分",
    "thumbs": 0,
    "title": "微积分救救孩子！",
    "type": 1,
    "user": 1
  }
}
function publishPost(p) {

}
module.exports = {
  lr581: lr581,
  logPost: logPost,
  publishPost: publishPost,
  loadPost: loadPost,
  thumbz: thumbz,
}