//lr580 function provide
function lr581()//用以测试该模块是否加载成功
{
  //在pages里的js尝试如下调用，测试是否成功加载该模块：
  //var modu = require('../../lrfx.js')
  //modu.lr581()
  console.log('successfully got lrfx.js')
}
function logPost() {

}
function loadPost(uid) {
  //wx.cloud.init({env:'scnuyjx-7gmvlqwfe64c446a'})
 const db = wx.cloud.database()
 //const po = db.collection(uid)
 //.log('po',po)
 const po = db.collection('post').doc(uid)
 //const po = db.collection('post').get().then(res =>{
 //  console.log('res',res.data)
 //})
 console.log('po',po)
 return po
}
function publishPost(p) {

}
module.exports = {
  lr581: lr581,
  logPost: logPost,
  publishPost: publishPost,
  loadPost: loadPost
}