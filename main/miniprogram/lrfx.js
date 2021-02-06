//lr580 function provide
function lr581(){//用以测试该模块是否加载成功
  //在pages里的js尝试如下调用，测试是否成功加载该模块：
  //var modu = require('../../lrfx.js')
  //modu.lr581()
  console.log('successfully got lrfx.js')
}
function getABS(content){//返回正文的预览
  const MAXWID=16//行宽
  const MAXLEN=4
  var nowlen=0
  var nr=[]
  for(let i=0;i<content.length;++i){
    if(content[i][0]==3){
      nr.push('[图片]')
      ++nowlen
    }
    else{
      var x=content[i][1].split('\n')
      for(let j=0;j<x.length;++j){
        var len=x[j].length
        var lenn=Math.floor(len/MAXWID)
        if(lenn<=0) lenn=1
        if(nowlen+lenn<MAXLEN){
          nr.push(x[j])
          nowlen+=lenn
        }
        else if(nowlen+lenn==MAXLEN){
          nr.push(x[j])
          if(!(j+1==x.length && i+1==content.length)) nr[nr.length-1]+='...'
          return nr
        }
        else{
          nr.push(x[j].slice(0,MAXWID*(MAXLEN-nowlen))+'...')
          return nr
        }
      }
    }
    if(nowlen>=MAXLEN && i+1!=content.length) {
      nr[nr.length-1]+='...'
      return nr
    }
  }
  return nr
  /*var nowlen=0
  var nr=''
  for(let i=0;i<content.length;++i){
    if(content[i][0]==3){
      nr+='[图片]'
      nowlen+=20
    }
    else{
      var x=content[i][1].split('\n')
      for(let j=0;j<x.length;++j)
      {
        var len=x[j].length
        if(nowlen+len<=MAXTOTLEN){
          nr+=x[j]
          nowlen+=len
        }
        else{
          nr+=x[j].slice(0,MAXTOTLEN-nowlen)
          nowlen=MAXTOTLEN+1
          break
        }
        if(nowlen>MAXTOTLEN) { nr+='…'
          break}
        if(len<20) nowlen+=20-len
        nr+='\n'
        if(nowlen>MAXTOTLEN) { nr+='…'
        break}
      }
    }
    if(nowlen>MAXTOTLEN)  { nr+='…'
    break}
    nr+='\n'
  }*/
  //return nr.split('\n')
}
module.exports = {
  lr581: lr581,
  getABS: getABS
}