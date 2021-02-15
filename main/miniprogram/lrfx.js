//lr580 function provide
function lr581() {//用以测试该模块是否加载成功
  //在pages里的js尝试如下调用，测试是否成功加载该模块：
  //const modu = require('../../lrfx.js')
  //modu.lr581()
  console.log('successfully got lrfx.js')
}
function getABS(content) {//返回正文的预览
  const MAXWID = 16//行宽
  const MAXLEN = 4
  var nowlen = 0
  var nr = []
  for (let i = 0; i < content.length; ++i) {
    if (content[i][0] == 3) {
      nr.push('[图片]')
      ++nowlen
    }
    else {
      var x = content[i][1].split('\n')
      for (let j = 0; j < x.length; ++j) {
        var len = x[j].length
        var lenn = Math.floor(len / MAXWID)
        if (lenn <= 0) lenn = 1
        if (nowlen + lenn < MAXLEN) {
          nr.push(x[j])
          nowlen += lenn
        }
        else if (nowlen + lenn == MAXLEN) {
          nr.push(x[j])
          if (!(j + 1 == x.length && i + 1 == content.length)) nr[nr.length - 1] += '...'
          return nr
        }
        else {
          nr.push(x[j].slice(0, MAXWID * (MAXLEN - nowlen)) + '...')
          return nr
        }
      }
    }
    if (nowlen >= MAXLEN && i + 1 != content.length) {
      nr[nr.length - 1] += '...'
      return nr
    }
  }
  return nr
}

function dateArr(dt) {//将日期对象转化为array(年月日时分秒)
  var a = [dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds()]
  for (let i = 0; i < a.length; ++i) {
    a[i] = String(a[i])
    if (a[i].length <= 1) a[i] = '0' + a[i]
  }
  return a
}

function dateStr(dt) {//将日期对象转化为String
  var a = dateArr(dt)
  return a[0] + '/' + a[1] + '/' + a[2] + ' ' + a[3] + ':' + a[4] + ':' + a[5]
}

var fakePost = {
  activeTime: new Date(),
  editTime: new Date(),
  releaseTime: new Date(),
  comment: [],
  anonymity: true,
  content: [[1, "该帖子不存在！"]],
  fatherPost: 0,
  fatherType: 1,
  hide: true,
  id: 1,
  pureText: '该帖子不存在！',
  reply: 0,
  tag: '',
  thumbs: 0,
  title: '404 NOT FOUND',
  type: 1,
  user: 1,
  _id: 1,
}

var fakeUser = {
  _id: 1,
  _openid: '1',
  browseLog: [],
  collect: [],
  image: 'default.jpg',
  nickName: '账号不存在',
  oldtest: true,
  publish: [],
  realName: '',
  school: '',
  schoolArea: '',
  thumbs: [],
  uid: 1,
  userType: 1,
}

module.exports = {
  lr581: lr581,
  getABS: getABS,
  dateArr: dateArr,
  dateStr: dateStr,
  fakePost: fakePost,
  fakeUser: fakeUser,
}