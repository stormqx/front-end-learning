# `Promise` 对象特点.

1. **对象状态不受外界影响。** `Promise`对象代表一个异步操作，有三种状态：`Pending`(进行中), `Resolved`(已完成,又称Fullfilled)和`Rejected`(已失败).只有异步操作的结果，可以决定当前状态，任何其他操作都无法改变这个状态。
2. **一旦状态改变，就不会再变，任何时候都可以得到这个结果。** 与事件(Event)完全不同，事件的特点是，如果你错过了再去监听，得不到结果。
3. 缺点：
  * 无法取消`Promise`，一旦新建就会立即执行， 无法中途取消。
  * 如果不设置回调函数，`Promise`内部抛出的错误，不会反应到外部。
  * 处于`Pending`状态时，无法得知目前进展到哪一阶段(刚开始还是即将完成)。

# 基本用法
Promise对象是一个构造函数，用来生成Promise实例。

`Promise`对象实现Ajax操作例子.

```js
var getJSON = function(url) {
  var promise = new Promise(function(resolve, reject) {
    var client = new XMLHttpRequest();
    client.open("GET", url);
    client.onreadystatechange = handler;
    client.responseType = 'json';
    client.setRequestHeader("Accept", "application/json");
    client.send();
    
    function handler() {
      if(this.readyState !== 4) {
        return ;
      }
      if(this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    }
  });
  
  return promise;
};

getJSON("/posts.json").then(function(json) {
  console.log('contents: ' + json);
}, function(error) {
  console.log('出错了', error);
});
```
`getJSON`内部，`resolve`函数和`reject`函数调用时，都带有参数，它们的参数会被传递给回调函数。`reject`函数的参数通常是Error对象的实例，表示抛出的错误；`resolve`函数的参数出了正常值之外，还可能是另外一个Promise实例，表示异步操作的结果有可能是一个值，已有可能是另一个异步操作。

```js
//demo1
var p1 = new Promise(function(resolve, reject) {
  setTimeout( () => reject(new Error('fail')), 3000)
})

var p2 = new Promise(function(resolve, reject) {
  setTimeout( () => resolve(p1), 1000)
})

p2
  .then(result => console.log(result))
  .catch(error => console.log(error))

//error: fail

--------------
//demo2
var p1 = new Promise(function(resolve, reject) {
  setTimeout( () => resolve('success'), 3000)
})

var p2 = new Promise(function(resolve, reject) {
  setTimeout( () => resolve(p1), 1000)
})

p2.
  then(result => console.log(result))
  .catch(error => console.log(error))
  
// success
```
上面代码demo1中，`p1`是一个Promise，3秒后变成`reject`。`p2`的状态在1秒后改变，`resolve`方法返回的是`p1`。由于`p2`返回的是另外一个Promise，所有`p1`的状态决定了`p2`的状态 (即`then`语句变成了针对`p1`),又过了2秒, `p1`变为`rejected`，导致触发`catch`方法指定的回调函数。  demo2同理。

# Promise.prototype.then()
`then`方法定义在原型对象Promise.prototype上，所以Promise实例具有`then`方法。它的作用是为Promise实例添加状态改变时的回调函数。第一个参数为Resolved状态的回调函数，第二个参数（可选）是Rejected状态的回调函数。

**`then`方法返回的是一个新的Promise实例（不是原来的那个Promise实例）**,因此可以采用链式写法。

采用链式的`then`，可以指定一组按照次序调用的回调函数。这时，前一个回调函数，有可能返回的还是一个Promise对象（即异步操作），后一个回调函数会等待该Promise对象的状态发生变化，然后才会被调用。

```js
getJSON('/post/1.json').then(
  post => getJSON(post.commentURL)
).then(
  comments = > console.log('Resolved: ' + comments),
  err = > console.log('rejected: ' + err)
);
```
上面代码中，第一个`then`方法指定的回调函数，返回的是另一个Promise对象。这时，第二个`then`方法指定的回调函数，就会等待这个新的Promise对象状体发生变化。

# Promise.prototype.catch()
`Promise.prototype.catch`方法是`.then(null, rejection)`的别名。

```js
getJSON('/posts.json').then(function(posts) {
  //...
}).catch(function(error) {
  //处理getJSON 和 前一个回调函数运行时发生的错误
  console.log('发生错误！', error)
})
```
`catch`方法不仅可以捕获Promise对象为`Rejected`的错误，在`then`方法指定的回调函数运行中抛出错误也会被捕获。

如果Promise状态已经变成了`Resolved`，再抛出错误是无效的。

一般来说，不要再`then`方法里面定义reject状态的回调函数(即`then`的第二个参数)。总是使用`catch`方法。