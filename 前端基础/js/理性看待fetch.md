> 本文是阅读[博客](https://undefinedblog.com/window-fetch-is-not-as-good-as-you-imagined/)笔记。

前端发送HTTP请求，前有骇人的`ActiveXObject`，后有`XMLHttpRequest`。

> **fetch 是一个 low-level 的 API，它注定不会像你习惯的 `$.ajax `等库帮你封装各种各样的功能或实现.**

## Fetch 发请求

向服务端发数据的过程,JQuery实现方法（出于兼容性考虑，大部分的项目在发送 POST 请求时都会使用 application/x-www-form-urlencoded 这种 Content-Type）：

```js
$.post('/api/add', {name: 'test'});
```

fecch处理方法:

```js
fetch('/api/add', {  
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  },
  body: Object.keys({name: 'test'}).map((key) => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&')
});
```

### Fetch发请求时默认不会带上cookie

带上cookie代码：

```js
fetch('/api/add', {  
  method: 'POST',
  credentials: 'include',
  ...
});
```

同理，post一个json到服务端:

```js
fetch('/api/add', {  
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  },
  body: JSON.stringify({name: 'test'})
});
```

## Fetch 错误处理

假如使用fetch请求不存在的资源：

```js
fetch('xx.png')  
.then(() => {
  console.log('ok');
})
.catch(() => {
  console.log('error');
});
```
结果console不会打出error，而打印出ok.

**按照 MDN 的[说法](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Checking_that_the_fetch_was_successful)，fetch 只有在遇到网络错误的时候才会 reject 这个 promise，比如用户断网或请求地址的域名无法解析等。只要服务器能够返回 HTTP 响应（甚至只是 CORS [preflight](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/en-US/docs/Glossary/Preflight_request) 的 OPTIONS 响应），promise 一定是 resolved 的状态。**

所以判断一个fetch请求是否成功需要使用`response.ok`。

```js
fetch('xx.png')  
.then((response) => {
  if (response.ok) {
    console.log('ok');
  } else {
    console.log('error');
  }
})
.catch(() => {
  console.log('error');
});
```

### Fetch 将`response.body`设计成`ReadableStream`，我们要多使用一次`response.json()`.

```js
fetch('/api/user.json?id=2')   // 服务端返回 {"name": "test", "age": 1} 字符串  
.then((response) => {
  // 这里拿到的 response 并不是一个 {name: 'test', age: 1} 对象
  return response.json();  // 将 response.body 通过 JSON.parse 转换为 JS 对象
})
.then(data => {
  console.log(data); // {name: 'test', age: 1}
});
```

### Fetch response 限制了响应内容的重复读取和转换

```js
var prevFetch = window.fetch;  
window.fetch = function() {  
  prevFetch.apply(this, arguments)
  .then(response => {
    return new Promise((resolve, reject) => {
      response.json().then(data => {
        if (data.hasError === true) {
          tracker.log('API Error');
        }
        resolve(response);
      });
    });
  });
}

fetch('/api/user.json?id=1')  
.then(response => {
  return response.json();  // 先将结果转换为 JSON 对象
})
.then(data => {
  console.log(data);
});
```

上面的当返回的JSON对象中`hasError`字段是`true`，记录出错的接口。但是这样的代码会导致:
> Uncaught TypeError: Already read

因此我们已经在AOP切面中调用过了`response.json()`.
### Fetch 不支持同步请求
有的项目因为历史架构原因需要使用同步请求。
### Fetch 不支持取消请求
使用 XMLHttpRequest 可以用 xhr.abort() 方法取消一个请求。
### Fetch 无法查看请求进度
使用 XMLHttpRequest 你可以通过 xhr.onprogress 回调来动态更新请求的进度，而这一点目前 fetch 还没有原生支持。

#总结
从读完这篇博客来看，我觉得目前使用fetch带来的问题大部分仍属于历史遗留问题，未来`fetch`代替`XMLHttpRequest`的大方向是没错的。 