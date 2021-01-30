//lr580 function provide
function lr581()//用以测试该模块是否加载成功
{
  //在pages里的js尝试如下调用，测试是否成功加载该模块：
  //var com = require('../../lrfx.js')
  //com.lr581()
  console.log('successfully got lrfx.js')
}
function logPost() {

}
module.exports = {
  lr581: lr581,
  logPost: logPost
}
