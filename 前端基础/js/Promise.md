# `Promise` 对象特点.

>在 ECMAScript Language Specification ECMA-262 6th Edition – DRAFT 中 [[PromiseStatus]] 都是在内部定义的状态。 由于没有公开的访问 [[PromiseStatus]] 的用户API，所以暂时还没有查询其内部状态的方法。

1. **对象状态不受外界影响。** `Promise`对象代表一个异步操作，有三种状态：`Pending`(进行中), `Resolved`(已完成,又称Fulfilled)和`Rejected`(已失败).只有异步操作的结果，可以决定当前状态，任何其他操作都无法改变这个状态。
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

then方法指定的回调函数，将在当前脚本所有同步任务执行完才会执行。
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

# Promise.all()
`Promise.all`方法用于将多个Promise实例，包装成一个新的Promise实例。

```js
var p = Promise.all([p1, p2, p3])
```
`Promise.all`方法接受一个数组作为参数(可以不是数据，但必须具有Iterator接口，且返回的每个成员都是Promise实例), `p1`, `p2`, `p3`都是Promise对象的实例，如果不是，会先调用`Promise.resolve`方法将参数转化为Promise实例。

`p`的状态由	`p1`, `p2`, `p3`决定，分成两种情况。

1. 只有`p1`, `p2`, `p3`的状态都为`fulfilled`，`p`的状态才会变成`fulfilled`，此时`p1`, `p2`, `p3`的返回值组成一个数组，传递给`p`的回调函数。
2. 只要`p1`, `p2`, `p3`中有一个被`rejected`, `p`的状态就变成了`rejected`，此时第一个被`reject`的实例返回值，会传递给`p`的回调函数。

```js
const databasePromise = connectDatabase();

const booksPromise = databasePromise
  .then(findAllBooks);

const userPromise = databasePromise
  .then(getCurrentUser);

Promise.all([
  booksPromise,
  userPromise
])
.then(([books, user]) => pickTopRecommentations(books, user));
```
上面代码中，`bookPromise`和`userPromise`是两个异步操作，只有等到它们的结果都返回了，才会触发`pickTopRecommentations`这个回调函数。

# Promise.race()
`Promise.race`方法同样是将多个Promise实例，包装成一个新的Promise实例。

```js
var p = Promise.race([p1, p2, p3]);
```
只要`p1`, `p2`, `p3`中有一个实例率先改变状态，`p`的状态就跟着改变。

```js
var p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function(resolve, reject) {
    setTimeout( () => reject(new Error('request timeout')), 5000)
  })
])

p.then( response => console.log(response))
 .catch( error => console.log(error))
```
上面代码中，如果5秒之内`fetch`方法无法返回结果，变量`p`的状态就会变成`rejected`,从而触发`catch`方法指定的回调函数。

# Promise.resolve()
`Promise.resolve`方法的作用是将现有对象转化为Promise对象。

```js
var jsPromise = Promise.resolve($.ajax('/whatever.json'));
```
上面代码将JQuery生成的`deferred`对象，转为一个新的Promise对象。

```js
Promise.resolve('foo')
// 等价于
new Promise(resolve => resolve('foo'))
```

# Promise.reject()
`Promise.reject(reason)`方法会返回一个状态为`rejected`的实例。

```js
var p = Promise.reject('出错了');
// 等同于
var p = new Promise((resolve, reject) => reject('出错了'))

p.then(null, function (s) {
  console.log(s)
});
// 出错了
```

# done()
Promise对象的回调链，不管以`then`方法或`catch`方法结尾，要是最后一个方法抛出错误，都有可能无法捕捉到（因为Promise内部的错误不会冒泡到全局）。因此，我们提供一个`done`方法，总是处于回调链的尾端，保证抛出任何可能出现的错误。

```js
Promise.prototype.done = function (onFulfilled, onRejected) {
  this.then(onFulfilled, onRejected)
    .catch(function (reason) {
      // 抛出一个全局错误
      setTimeout(() => { throw reason }, 0);
    });
};
```

# finally()
`finally`方法与`done`方法的最大区别，它接受一个普通的回调函数作为参数，该函数不管怎样都必须执行。

```js
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};
```

不管前面的Promise是`fulfilled`还是`rejected`，都会执行回调函数`callback`。

## 使用promise实现ajax请求

```js
'use strict';

// A-> $http function is implemented in order to follow the standard Adapter pattern
function $http(url){

  // A small example of object
  var core = {

    // Method that performs the ajax request
    ajax : function (method, url, args) {

      // Creating a promise
      var promise = new Promise( function (resolve, reject) {

        // Instantiates the XMLHttpRequest
        var client = new XMLHttpRequest();
        var uri = url;

        if (args && (method === 'POST' || method === 'PUT')) {
          uri += '?';
          var argcount = 0;
          for (var key in args) {
            if (args.hasOwnProperty(key)) {
              if (argcount++) {
                uri += '&';
              }
              uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
            }
          }
        }

        client.open(method, uri);
        client.send();

        client.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            // Performs the function "resolve" when this.status is equal to 2xx
            resolve(this.response);
          } else {
            // Performs the function "reject" when this.status is different than 2xx
            reject(this.statusText);
          }
        };
        client.onerror = function () {
          reject(this.statusText);
        };
      });

      // Return the promise
      return promise;
    }
  };

  // Adapter pattern
  return {
    'get' : function(args) {
      return core.ajax('GET', url, args);
    },
    'post' : function(args) {
      return core.ajax('POST', url, args);
    },
    'put' : function(args) {
      return core.ajax('PUT', url, args);
    },
    'delete' : function(args) {
      return core.ajax('DELETE', url, args);
    }
  };
};
// End A

// B-> Here you define its functions and its payload
var mdnAPI = 'https://developer.mozilla.org/en-US/search.json';
var payload = {
  'topic' : 'js',
  'q'     : 'Promise'
};

var callback = {
  success : function(data){
     console.log(1, 'success', JSON.parse(data));
  },
  error : function(data){
     console.log(2, 'error', JSON.parse(data));
  }
};
// End B

// Executes the method call
$http(mdnAPI)
  .get(payload)
  .then(callback.success)
  .catch(callback.error);

// Executes the method call but an alternative way (1) to handle Promise Reject case
$http(mdnAPI)
  .get(payload)
  .then(callback.success, callback.error);

// Executes the method call but an alternative way (2) to handle Promise Reject case
$http(mdnAPI)
  .get(payload)
  .then(callback.success)
  .then(undefined, callback.error);
```


##  一道与promise resolve()执行顺序相关的题

```js
function inner () {
  new Promise(function(resolve,reject){
    resolve()
  }).then(function(){
    console.log('Inner Promise')
  })
}
function outer() {
  return new Promise(function(resolve, reject){
    resolve()
    inner()
  })
}

outer().then(function(data) {
  console.log('Outer Promise')
})
```
上述代码的输出结果是:

```js
Inner Promise
Outer Promise
```
出现该输出结果的原因是`inner()`promise的`.then()`方法先执行，`outer()`promise的`.then()`方法后执行。
### promise resolve内部做了什么?
`resolve()`将promise的内部状态变成`Fulfilled`。与此同时，如果有任何`.then()` handlers 已经附加到了promise上，当stack unwinds并且当前运行路径上的js运行完成将控制权返回给系统时，`.then()`方法会被添加到执行队列中去。如果还没有任何已经注册的`.then()` handlers，则任何内容都不会添加到队列中。

Promise的resolve action不会被添加到队列中去，`resolve()`是同步的。它会立即将当前promise的状态变成`Fulfilled`。如果在promise resolved的时候，有`.then()` handlers已经被注册，接下来它们被添加到队列中。但是，在上面的例子中，在每一个promise resolved的时候，都没有附加`.then()` handlers。所以，`.then()`处理程序不会在promise解决的时候加入队列。相反，它们会在`.then()`方法实际运行并注册它们时加入队列。

接下来分析一下上述代码的运行过程：

1. 首先调用`outer()`, 此时会创建一个Promise对象并且同步调用传递给该Promise的executor回调函数。
2. 接下来调用`resolve()`,他会讲当前附加的`.then()` handlers的调用进行排队。注意，在上述代码调用`resolve()`的时候是没有`.then()` handlers。因为我们仍然在运行`outer()`并且它之后的`.then()`是实际上是没有排队的。
3. 调用`inner()`，同样会创建一个新的Promise对象并且同步调用传递给该Promise的executor回调函数。再次，还没有任何`.then()` handlers附加，所以仍然没有其他要安排的执行动作。
4. 现在,`inner()`内部的Promise executor返回并调用`inner()`后的`.then()`方法。这个Promise已经被resolved，当`.then()` handlers被调用时，Promise知道未来`.then()` handlers会被调用。因为当堆栈解开到只有平台代码(platform code)时，所有`.then()`处理程序才会被异步调用，它不会立即运行。但是它们会被放在队列中，具体的队列如何实现方法不一，但是根据Promise规范可以保证在当前的同步JS代码执行完成后会执行队列中的`.then()` handlers,最后返回控制给系统。
5. 接下来`inner()`返回(此时代码还是在同步执行)
6. 接下来`outer()`返回，`outer().then()`调用并加入到队列中去。
7. 接下来会先执行`inner()`Promise的 `.then()` handler，再执行`outer()`Promise的`.then()` handler.
8. 注意：虽然`outer()` Promise先resolved，但是在它resolved的时候没有`.then()` handler 附加，所以不会调用`.then()`handler.

## 一道与promise相关的面试题

今天在知乎上看到一道有趣的关于promise的面试题。

```js
setTimeout(function() {
  console.log(1)
}, 0);
new Promise(function executor(resolve) {
  console.log(2);
  for( var i=0 ; i<10000 ; i++ ) {
    i == 9999 && resolve();
  }
  console.log(3);
}).then(function() {
  console.log(4);
});
console.log(5);

```


* **首先，1不会被第一个log。**
	
	我们聊聊`setTimeOut(function, delay)`,第二个delay是指在是指在执行代码前需要等待多少秒，但经过该时间后指定的代码不一定会执行。
	
	因为JavaScript是一个单线程序的解释器，因此一段时间只能执行一段代码。为了控制要执行的代码，就要有一个JavaScript任务队列。这些任务会按照他们被添加进任务队列的顺序执行。所以delay的意思是告诉JavaScript再过多长时间把function添加到任务队列中去。如果队列是空的，那么function会被立即执行；否则，function需要等前面的代码执行完以后再执行。

* **`executor`函数中先log 2，再log 3**

	接下来我们聊聊`new Promise(/* executor */ function(resolve, reject){...});` 其中executor函数在实现promise对象时立即被调用，resolve和reject参数会被传入(executor函数甚至在Promise的构造函数返回之前就被执行)。
	
	如果你看了上面的`inner()`Promise 和`outer()` Promise的话，在`executor`函数中会先log出2，接下来运行`resolve()`函数，因为此时没有任何`.then()` handler附加，所以会继续运行`executor`函数log出3.

* **先log出5，再log出4**
   当log出3之后，Promise返回然后调用`.then()` handler,但是它不会立即执行`.then()` handler, 而是将它放入队列中，当堆栈解开到只有平台代码(platform code)时，所有`.then()`处理程序才会被异步调用。所以会先log出5，接下来没有任何同步代码，会执行队列中的`.then()`函数。
   
* **为什么先log出4，再log出1**
	是因为 原生的`Promise.then()`里面的回调属于 microtask, 会在当前 Event Loop 的最后执行, 而 SetTimeout 内的回调属于 macrotask, 会在下一个 Event Loop 中执行.(TODO: 认真研究Event Loop)