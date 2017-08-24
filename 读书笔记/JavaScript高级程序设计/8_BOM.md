# BOM
BOM: browser object model. 提供了很多对象用于访问浏览器的功能。

## window对象

window表示浏览器的一个实例。在浏览器中，window有双重角色：

1. 它是通过JavaScript访问浏览器窗口的一个接口；
2. 它是ECMAScript规定的global对象；


### 全局作用域
由于window对象扮演global对象，所以在全局作用域中声明的变量，函数都会变成window对象的属性和方法。

### 窗口关系和框架

* top对象始终指向最高(最外)层的框架，也就是浏览器窗口。
* parent对象始终指向当前框架的直接上层框架。
* self对象始终指向window。

### 窗口大小
chrome中:

```js
window.innerWidth = window.outerWidth = document.documentElement.clientWidth = 页面视口的大小(减去边框宽度)

window.innerHeight = window.outerHeight = document.documentElement.clientHeight = 页面视口的大小(减去边框宽度)
```

### 打开窗口

```js
window.open()
```

### setTimeout和setInterval
第一个参数传递字符串可能导致性能损失，建议用函数。

`setTimeout`和`setInterval`的代码是在全局作用域下执行的，因此函数中的`this`值在非严格模式下指向`window`对象，严格模式下指向`undefined`.

`clearTimeout`和`clearInterval`.

## location

`window.location === document.location`

location用处：保存当前文档的信息，将URL解析为独立的片段。

| 属性名 | 例子 | 
| ----- | ----- |
| hash |  #contents |
| host | www.qx.com:80 |
| hostname | www.qx.com |
| href | http://www.qx.com |
| pathname | /router |
| port | 80 |
| protocol | http: |
| search | ?q=js |

改变位置:

```js
location.assign("http://www.qx.com")

window.location = "http://www.qx.com"

location.href = "http://www.qx.com"  //常用
```

使用location修改url会在历史记录中生成一条新纪录。但是使用`replace`方法不会生成新纪录。用户不能回到前一个页面。

## history对象

```js
// 后退一页
history.go(-1);

// 前端一页
history.go(1);
```


