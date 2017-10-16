## 条件逻辑(conditional logic)

### 场景：用户授权

#### 版本一：

```js
// conditional async step
var user = {
  authenticated: false,
  
  login: function() {
    // return a promise for the login request
    // set authenticated to ture and fulfill promise when login succeeds
  }
}

// avoid this style of conditional async execution
function showMainMenu() {
  if(!user.authenticated) {
    user.login().then(showMainMenu);
    return;
  }
  // ...code to display main menu
}
```

**缺点：**

1. 如果`login`过程失败了，menu不会显示fail。因为`showMainMenu`依靠的promise返回一个promise来描述当前的状态。
2. `showMainMenu`的行为可能是同步的，也可能是异步的。这取决于用户是否已授权。(**原因：我们已经知道`Promise.then()`属于`microTask`，所以在用户没有登录时，`login`后调用的`showMainMenu`会在该eventLoop结束时执行，是异步的。而在用户登录时，`showMainMenu`的执行是同步的。**)

#### 版本二

```js
function showMainMenu() {
  var p = (!user.authenticated) ? user.login() : Promise.resolve();
  
  return p.then(function () {
    // ...code to display main menu
  })
}
```

版本二的代码，无论是否登录，都调用`Promise.then`来执行显示主菜单的代码，保证了该代码总是在micro task执行时执行。同时`showMainMenu`代码最终返回描述执行结果的promise。

#### 版本三

我们将是否登录这个条件逻辑封装成一个promise.

```js
function showMainMenu() {
  return user.login().then(function () {
    // ...code to display main menu
  })
}
```

#### 版本四

但这并不意味着调用`showMainMenu`都会重复`login`的所有步骤。`login`返回的promise可以被缓存和复用。

```js
// caching a promise

var user = {
  loginPromise: null,
  
  login: function () {
    var me = this;
    
    if(this.loginPromise === null) {
      this.loginPromise = ajax(/*someurl*/);
      
      // 当出现错误，应该清掉缓存的loginPromise, 允许重新尝试登录
      this.loginPromise,catch(function () {
        me.loginPromise = null;
      });
    }
    
    return this.loginPromise;
  }
}
```

## 并行执行(parallel execution)

场景：当你登录一个金融网站，显示属于你的更新后的所有银行账户和信用卡信息。

```js
// running asynchronous tasks in parallel
var accounts = ['Checking Account', 'Travel Rewards Card', 'Big Box Retail Card'];

console.log('updating balance information...');

account.forEach(function(account) {
  // ajax() returns a promise eventually fulfilled by the account balance
  ajax(/*someurl for account*/).then(function (balance){
    console.log(account + 'balance' + balance);
  });
})


// console output:
// updating balance information...
// Checking Account Balance: 384
// Travel Rewards Card Balance: 509
// Big Box Retail Card Balance: 0
```

promise支持将并行的任务聚合成一个单独的promise，即使用`Promise.all`, 如果所有的promises全为`fulfilled`状态则变为`fulfilled`状态，如果任何一个promise被`rejected`，新的promise即被`rejected`.

```js
// 使用`Promise.all`将并行任务的结果聚合。

var request = accounts.map(function (account) {
  return ajax(/*someurl for account*/);
});

Promise.all(request).then(function (balances) {
  console.log('All' + balances.length + 'balances are up to date');
}).catch(function (error) {
  console..log('an error occurred while retrieving balance information');
  console.log(error);
});

// console output:
// All 3 balances are up to date
```

此外，也可以实现不管promise是`fulfilled`或者`rejected`，只等待所有`promise`的操作结果。

```js
fucntion settled(promises) {
  var alwaysFulfilled = promises.map(function (p){
    return p.then(
      function onFulfilled(value) {
        return { state: 'fulfilled', value: value }
      },
      function onRejected(reason) {
        return { state: 'rejected', reason: reason}
      }
    );
  });
  return Promise.all(alwaysFulfilled);
}

// update status message once all requests finish
settled(requests).then(function (outcomes) {
  var count = 0;
  outcomes.forEach(function (outcome) {
    if(outcome.state == 'fulfilled') count++;
  });
  console.log(count + 'out of' + outcomes.length + 'balances were updated');
})

// console output(varies based on requests):
// 2 out of 3 balances were updated
```

## 顺序执行使用循环或者递归(sequential exectution using loops or recursion)

我们先来使用循环写一个并行任务。

```js
var products = ['sku1', 'sku2', 'sku3'];
products.forEach(function (sku) {
  getInfo(sku).then(function (info) {
    console.log('info for sku' + info);
  });
});

function getInfo(sku) {
  console.log('request info for ' + sku);
  return eval(sku)();
}

function sku1() {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(1); 
        }, 3000);

    })
}


function sku2() {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(2); 
        }, 2000);

    })
}

function sku3() {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(3); 
        }, 1000);

    })
}

// console output:
// requested info for sku1
// requested info for sku2
// requested info for sku3
// info for sku3
// info for sku2
// info for sku1
```

接下来，我们尝试用循环写一个顺序链。

```js
function sequence(array, callback) {
  return array.reduce(function chain(promise, item) {
    return promise.then(function(...value) {
      callback(item, ...value);
    });
  });
}

var products = ['sku-1', 'sku-2', 'sku-3'];

sequence(products, function(sku) {
  return getInfo(sku).then(function (info) {
    console.log(info);
  }).catch(function (reason) {
    console.log(reason);
  });
});

function getInfo(sku) {
  console.log('requested info for' + sku);
  return ajax(/*someurl for sku*/);
}

// Console output:
// Requested info for sku-1
// Info for sku-1
// Requested info for sku-2
// Info for sku-2
// Requested info for sku-3
// Info for sku-3
```

使用递归写顺序链。

```js
function readAllChunks(readableStream) {
  var reader = readableStream.getReader();
  var chunks= [];
  
  return pump();
  
  function pump() {
    return reader.read().then(function (result) {
      if(result.done) {
        return chunks;
      }
      
      chunks.push(result.value);
      return pump();
    })
  }
}
```

使用递归的好处是`Promise.then`必须等到前面的promise `resolve`的时候才会被添加到链子上。而使用循环在构建promise链时不需要等待任何的promise `resolve`。

## 管理延迟(managing latency)

场景：我们需要`getData`方法从服务器拉取数据。同步的，如果服务钱相应比较慢，我们拉取缓存来显示。如果上述两种情况在规定时间内都没响应，则`getData`返回`rejected`的promise.

```js
function getData() {
  var timeAllowed = 500; // milliseconds
  var deadline = Date.now() + timeAllowed;
  
  var freshData = ajax(/*someurl*/);
  
  var cachedData = fetchFromData().then(function(data) {
    var timeRemaining = Math.max(dealine - Date.now(), 0);
    setTimeout(function() {
      resolve(data);
    }, timeRemaining);
  });
  
  var failure = new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error('Unable to fetch data in allotted time'));
    }, timeAllowed);
  });
  
  return Promise.race([freshData, cachedData, failure]);
}
```

上述代码看起来很好，但是还是有一个缺点：当网络请求失败并很快返回，在这种情况下，如果在允许的时间内，我们仍然希望使用缓存的数据。**这种场景下，响应式编程(Reactive Programming)的经典场景即此(RxJS, Bacon.js等)**

## promise pipeline

```js
function processImage(image) {
  var customScaleToFit = scaleToFit.bind(null, 300, 450);
  var customWatermark = watermark.bind(null, 'the real estate company');
  
  return Promise.resolve(image)
    .then(customScaleToFit)
    .then(customWatermark)
    .then(grayscale);
}
```