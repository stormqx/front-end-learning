# node简介
node.js不是一个JavaScript应用程序，而是一个JavaScript运行环境，使用C++编写，基于V8引擎。

node特点：

* 异步I/O

 ![经典ajax调用](image/classic_ajax_call.png)

* 事件与回调函数

Ajax异步提交的服务器端处理过程。

```js
var http = require('http');
var querystring = require('querystring');

//侦听服务器的request事件
http.createServer(function(req, res) {
  var postData = '';
  res.setEncoding = 'utf8';
  
  //侦听请求的data事件
  req.on('data', function(trunk) {
    postData += trunk;
  });
  //侦听请求的end事件
  req.on('end', function(){
    res.end(postData);
  });
}).listen(8080);
console.log('服务器启动完成');



//相应的前端ajax请求绑定了success事件
$.ajax({
  'url': '/url',
  'method': 'POST',
  'data': {},
  'success': function(data) {
    //success事件
  }
});
```
JavaScript中将函数作为第一等公民来对待，可以将函数作为对象传递给方法作为实参进行调用，所以回调函数无处不在。

* 单线程
好处：不用像多线程编程处处在意状态的同步问题，没有死锁，没有线程上下文切换带来的性能开销。
弱点：
	1. 无法利用多核CPU.
	2. 错误会引起整个应用程序退出，健壮性值得考验.
	3. 大量计算占用CPU导致无法继续调用异步I/O.

* 跨平台

![libnv](image/libnv.png)

# node应用场景
毫无疑问，IO密集型node非常强，因为Node面向网络并且擅长执行并行IO，能够有效的组织起更多的硬件资源。

对于CPU密集型的应用，其实v8的深度优化导致计算能力实际上很强，只不过js为单线程应用，长时间计算会阻塞而已，但是通过拆分分解还是不错的。可以使用一些c++的扩展方式，或者通过子进程将一部分的node进程当做常驻服务进行计算。

所以CPU密集型不可怕，合理的调度才是诀窍

# 模块机制
## commonJS的出发点
对于JavaScript自身而言，他的规范依然薄弱，有以下缺陷：

* 没有模块系统
* 标准库较少。对去文件系统，I/O流等没有标准API。W3C标准化推进仅限于浏览器端。
* 没有标准接口
* 缺乏包管理系统。
![node_commonJS_relationship.png](image/node_commonJS_relationship.png)

##commonJS的模块规范
### 模块引用
```js
var math = require('math');
```
require()方法接收模块标识，引入一个模块的API到当前上下文中。
### 模块定义
Node中，一个文件是一个模块，模块中存在一个module对象，代表模块本身。exports是module的属性，exports对象用于到处当前模块的方法或变量。

exports和module.exports内部大概是这样:
```
exports = module.exports = {};
```  

* exports是module.exports的一个引用

* require引用模块后，返回给调用者的是module.exports而不是exports

* `exports.xxx=`相当于在导出对象上挂属性，该属性对调用模块直接可见

* `exports =`相当于给exports对象重新赋值，调用模块不能访问exports对象及其属性

* 如果此模块是一个类，就应该直接赋值`module.exports`，这样调用者就是一个类构造器，可以直接new实例


### 模块标识
require()方法的参数，必须是符合小驼峰明明的字符串，以.、..开头的相对路径，或者绝对路径，可以没有文件后缀名.js。

模块的意义：**将类聚的方法和变量等限定在私有的作用域上，支持引入和导出功能来连接上下文依赖。**
![模块定义](image/module_define.png)
## node模块实现
node引入模块经历步骤：

  1. 路径分析
  2. 文件定位
  3. 编译执行
  
### 路径分析  
node模块路径的生成规则,与JavaScript的原型链或作用域链的查找方式类似：

* 当前文件目录下的node_modules目录。
* 父目录下的node_modules目录。
* 沿路径向上逐级递归，直到根目录下的node_modules目录。

### 文件定位
require()中文件扩展名：

* 诀窍一：如果是.node和.json文件，在传递给require()的标识符中带上扩展名，会加快速度。
* 诀窍二: 同步配合缓存，可以大幅度缓解Node单线程中阻塞式调用的缺陷。

### 模块编译
在Node的API文档中，每个模块存在require, exports, module, __filename, __dirname这些变量, 但是在模块文件中并没有定义,这些变量从何而来？
> 在编译的过程中，Node对获取的JavaScript文件内容进行了头尾包装。
> 头部添加了:`(function (exports, require, module, __filename, __dirname) {\n`
> 尾部添加了:`\n});`






  

  