**不要在master分支直接上传压缩包；如果上传压缩包请传至backup分支**，master分支只传代码

请确保开始写代码之前，你当前项目代码的版本跟github上一致(如不一致更新为master分支的版本)

# 项目配置

打开项目：用微信开发者工具的导入项目，选择main文件夹

配置：appid为wx62bf88f7371aa99a

编译模式从普通编译改成discuss



# 全局

制定中……

## 云开发

### 存储

pic 程序用到的图标等

postpic 发帖的图片

userpic 用户头像的图片

### 数据库

post 帖子

user 用户

## 函数接口

加载：

```javascript
var modu = require('../../lrfx.js')
modu.lr581() //如果有必要，调试是否加载成功，成功后删掉即可
```



## 对象格式

用户对象

- uid : number //与_id一致
- realName : string
- nickName : string
- school : string
- schoolArea : string
- grade : string
- major : string
- image : string(?)
- userType : number //1学生，2管理员，3教师
- browseLog : array(object:(number, Date))
- collect : array(number)
- publish : array(number)
- thumbs : array(number)

帖子对象

- id : number //与_id一致
- type : number //0~4是回复，问答，交流，分享，日志
- releaseTime : Date
- editTime : Date
- activeTime : Date
- tag : string
- user : number
- title : string
- thumbs : number //点赞数
- content : array( [number, string] ) 
  comment : array(number)

注释：

> 对content：number为下列时，内容意义如下：
>
> 1. 常规文本
> 2. 加粗文本
> 3. 图片(相对路径，如a.png)，存在后端的postpic文件夹里