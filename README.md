**不要在master分支直接上传压缩包；如果上传压缩包请传至backup分支**，master分支只传代码

为了减少同步代码的麻烦，请确保开始写代码之前，你当前项目代码的版本跟github上一致(如不一致更新为master分支的版本)

项目需求细节可以看"初步方案(第二稿).md"，该文档**实时更新**。

# 项目配置

打开项目：用微信开发者工具的导入项目，选择main文件夹

配置：appid为wx62bf88f7371aa99a

编译模式是普通编译

> 备注：如果报错Error: socket hang up是微信服务器的问题，重启或过一段时间就好了



# 全局

制定中……

## 全局变量

userID //打开改程序的用户的uid，为0未登录(游客模式)

maxuid //当前最大的用户uid，为0读取失败(废置)

maxpid //当前最大的帖子id，为0读取失败(废置)

## 云开发

### 存储

pic 程序用到的图标等

postpic 发帖的图片

- 名称为帖子id+_+整数

userpic 用户头像的图片

- 名称与uid一致
- 后缀为常见后缀，如：jpg,png

### 数据库

post 帖子

user 用户

global 全局信息

#### global

##### default

- maxuid: (number)当前最大用户uid
- maxpid: (number)当前最大帖子id (被废置)
- users: (number)当前用户总数 [待定是否有用]

##### catagory

- cat:(array:(number,string) ) 标签优先级(大的最先显示)和标签名
  暂定优先级=使用次数；同次数时按拼音序排序

##### username

- 用户名:id 的若干记录，类似于(python的)dict
  用途是新建用户时以较高速度检测是否重名(以免读取所有用户记录，而是只读一条global记录)
  其二是用于用户名与id的快速对应，同理提高速度

##### help

- 有一条名为content的array(title(string), content(同帖子的<u>content</u>))记录：

## 函数接口

(以lrfx.js为例)加载：

```javascript
const modu = require('../../lrfx.js')
modu.lr581() //如果有必要，调试是否加载成功，成功后删掉即可
```



## 对象格式

用户对象

- uid : number //与_id一致
- realName : string //大于2字符小于16字符
- nickName : string //不可以设为"匿名用户"，大于2字符小于16字符
- school : string
- schoolArea : string
- grade : string
- major : string
- image : string //不含目录的路径，如'a.png'(oldtest=true时的头像相对地址)
- userType : number //1学生，2管理员，3教师
- browseLog : array(object:(number, Date,number)) //帖子id，浏览日期，发帖人id
- collect : array(number)
- publish : array(number)
- thumbs : array(number)
- oldtest:(bool) true //只有测试虚拟用户才有该属性(id为1~4)
- _openid:string
- avatarUrl:string(oldtest=false时的头像完整(https)地址)
- newInfo:number(新消息数目)
- infos:array(date,bool,number,number, number,number)
  - date代表消息时间
  - bool代表是否已读(打开消息窗口后**全部**置已读，即true)
  - number 消息类型：0是点赞消息，1是回帖消息，2是回帖编辑信息
  - number 帖子id
  - number 执行者(点赞者/回帖者)uid (0代表匿名用户)
  - number 原贴id(当帖子id为回帖id时二者不同)
- realName:string //实名

帖子对象

- id : number //与_id一致

- type : number //0~4是回复，问答，交流，分享，日志

- releaseTime : Date

- editTime : Date

- activeTime : Date

- tag : string

- user : number

- title : string //大于1字符小于40(?)字符

- thumbs : number //点赞数

- content : array( [number, string] )

  >  对content：number为下列时，内容意义如下：
  >
  > 1. 常规文本
  > 2. 加粗文本
  > 3. 图片(相对路径，如a.png)，存在后端的postpic文件夹里

- comment : array(number)

- reply : number //回帖嵌套(该帖子回复reply回帖id)(0代表无)

- anonymity : bool //是否匿名

- hide : bool //是否隐藏(实现删除(和可能的撤销删除))

- fatherPost:number //回帖的父贴id(主贴值为0)

- fatherType:number//回帖类型(用于搜索，主贴显示同type)

- pureText : string //正文纯文本(废置)

  > 技术问题已解决，目前pureText废置

注释：

# 待改进事项

1. 帖子的显示页面，所有数据读取都没有写读取失败的异常处理代码
2. 现有测试样例数据中，有一部分是在非正常途径或有bugs版本发布的，所以可能存在数据上的问题

