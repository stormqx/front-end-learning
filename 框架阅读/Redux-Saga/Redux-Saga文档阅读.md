# Sagas版本的"Hello, world"

1. 先创建一个`sagas.js`的文件.

```js
export function* helloSaga() {
  console.log('Hello Sagas!');
}
```

为了运行Saga,需要:

* 以Sagas列表创建一个Saga Middleware.
* 将这个Saga Middleware连接到Redux store.

```js
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { helloSaga } from './sagas';

const store = createStore(
  reducer,
  applyMiddleware(createSagaMiddleware(helloSaga))
)
```

首先引入了`./sagas`模块中的Saga，然后使用`redux-saga`模块的`createSagaMiddleware`工厂函数来创建一个Saga middleware。 `createSagaMiddleware`接受Sagas列表，这些Sagas将会通过创建的Middleware被立即执行。

## 异步调用

写一个计数器的例子。

```js
const Counter = ({ value, onIncrement, onDecrement, onIncrementAsync }) =>
  <div>
    ...
    {' '}
    <button onClick={onIncrementAsync}>Increment after 1 second</button>
    <hr />
    <div>Clicked: {value} times</div>
  </div>
```

将`onIncrementAsync`与Store action联系起来。

修改`main.js`模块：

```js
function render() {
  ReactDOM.render(
    <Counter
      ...
      onIncrementAsync={() => action('INCREMENT_ASYNC')}
    />,
    document.getElementById('root')
  )
}
```

与redux-thunk不一样， 上面组件发起的是一个普通对象格式的action.

> 编写执行异步调用的saga: 等待1秒，然后增加计数

```js
// sagas.js
import { takeEvery } from 'redux-saga';
import { put } from ' redux-saga/effects';

// 一个工具函数： 返回一个Promise, 这个Promise将在ms秒后resolve.
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// worker Saga: 将异步执行 increment 任务
export function* incrementAsync() {
  yield call(delay, 1000)
  yield put({ type: 'INCREMENT' })
}

// watcher Saga: 在每个 INCREMENT_ASYNC action调用后，派生一个新的incrementAsync任务
export function* watchIncrementAsync() {
  yield* takeEvery('INCREMENT_ASYNC', incrementAsync)
}
```

写成`call(delay, 1000)`而不是`delay(1000)`是为了更容易测试，`put`和`call`返回文本对象，`delay(1000)`返回Promise.

## Saga辅助函数

常见的AJAX请求:

```js
import { call, put } from 'redux-saga/effects';
import { takeEvery } from 'redux-saga';

export function* fetchData(action) {
  try{
    const data = yield call(API.fetchUser, action.payload.url);
    yield put({type: "FETCH_SUCCEEDED", data});
  } catch (error) {
    yield put({type: "FETCH_FAILED", error});
  }
}

function* watchFetchData() {
  yield* takeEvery("FETCH_REQUESTED", fetchData)
}
```

`takeEvery`允许多个`fetchData`实例同时启动。

如果只想得到最新请求的响应（例如，始终显示最新版本的数据)。 可以使用`takeLatest`辅助函数。

```js
import { takeLatest } from 'redux-saga';

function* watchFetchData() {
  yield* takeLatest("FETCH_REQUESTED", fetchData);
}
```

`takeLatest`只允许执行一个`fetchData`任务，并且这个任务是最后被启动的那个。如果之前已经有一个任务在执行，之前的这个任务会自动被取消。

## 声明式Effects

Effects看作是发送给Middleware的指令以执行某些操作(调用某些异步函数，发起一个action到store)。

概括来说，从 Saga 内触发异步操作（Side Effect）总是由 yield 一些声明式的 Effect 来完成的 （你也可以直接 yield Promise，但是这会让测试变得困难)。

一个 Saga 所做的实际上是组合那些所有的 Effect，共同实现所需的控制流。 最简单的是只需把 yield 一个接一个地放置，就可对 yield 过的 Effect 进行排序。你也可以使用熟悉的控制流操作符（if, while, for） 来实现更复杂的控制流。

## 监听未来的action（take）

`takeEvery`是在更强大的低阶API`take`上构建的辅助函数。`take`让我们通过全面控制action观察进程来构建复杂的控制流成为可能。

```js
import { takeEvery } from 'redux-saga'

function* watchAndLog(getState) {
  yield* takeEvery('*', function* logger(action) {
    console.log('action', action)
    console.log('state after', getState())
  })
}
```

等价于:

```js
import { take } from 'redux-saga/effects'

function* watchAndLog(getState) {
  while(true) {
    const action = yield take('*')
    console.log('action', action)
    console.log('state after', getState())
  }
}
```

在`take`的情况下，它会暂停Generator直到一个匹配的action被发起。上面运行了一个无限循环的`while(true)`，这是一个Generator函数，它不具备`运行至完成的行为`(run-to-completion behavior)。Generator将在每次迭代上阻塞以等待action发起。

### push 和 pull 方法
在`takeEvery`的情况下，被调用的任务无法控制何时被调用，它们将在每次action被匹配时一遍又一遍的调用。并且她们也不无法控制何时停止监听。

在`take`情况中，控制恰恰相反。与action被*推向(pushed)*任务处理函数不同，Saga是自己主动*拉取(pulling)* action的。看起来就像是Saga在执行一个普通的函数调用`action = getNextAction()`，这个函数将在action被发起时resolve。

比如在todo应用中，希望监听用户的操作，并在用户初次创建完三条Todo信息时显示祝贺信息。

```js
import { take, put } from 'redux-saga/effects';

function* watchFirstThressTodosCreation() {
  for(let i = 0; i < 3; i++) {
    const action = yield take('TODO_CREATED');
  }
  yield put({type: 'SHOW_CONGRATULATION'})
}
```
这里与`while(true)`不同，我们运行一个只迭代三次的`for`循环。在`take`初次的3个`TODO_CREATED` action之后，`watchFirstThreeTodosCreation` Saga会将使应用显示一条祝贺信息然后种植。这意味着Generator会被回收并且相应的监听不会再发生。

主动拉取 action 的**另一个好处**是我们可以使用熟悉的同步风格来描述我们的控制流。假设我们希望实现一个登陆控制流，有两个action分别是`LOGIN`和`LOGOUT`。使用`takeEvery`（或者redux-thunk）我们必须要写两个分别的任务(或者thunks)：一个用于`LOGIN`, 另一个用于`LOGOUT`.

**这种做法将逻辑分开在两个地方，他人必须阅读两个处理函数的源代码并且要在两处逻辑之间建立连接。不利于理解控制流。**

使用pull模式，我们可以在同一个地方写控制流。

```js
function* loginFlow() {
  while(true) {
    yield take('LOGIN');
    // ...perform the login logic
    yield take('LOGOUT');
    // ...perform the logout logic
  }
}
```

`loginFlow` Saga更好理解，因为序列中的action是期望之中的。它知道`LOGIN` action后面应该始终跟着一个`LOGOUT` action。 `LOGOUT`也应该始终跟在一个`LOGIN`后面。（一个好的 UI 程序应该始终强制执行顺序一致的 actions，通过隐藏或禁用意料之外的 action）。

## 无阻塞调用

当解决并发action的情况，redux-saga提供了另一个Effect: `fork`。当fork一个任务时，任务会在后台启动，调用者可以继续它自己的流程，而不用等待被fork的任务结束。

为了**取消** `fork`任务，redux-saga提供了一个指定的Effect `cancel`。 `cancel` Effect不会粗暴的结束我们的`fork`任务，他会在里面跑出一个特殊的错误，给`fork`任务一个机会来执行它自己的清理逻辑。而被取消的任务应该捕捉这个错误，假设它需要爱结束之前做一些事情的话。

## 同时执行多个任务

`yield`指令可以简单的将异步控制流以同步的写法表现出来。但如果我们同时处理多个没有依赖的任务时，我们不能直接这样写：

```js
// 错误写法，effects将按照顺序执行
const users = yield call(fetch, '/users');
const repos = yield call(fetch, '/repos');
```

由于第二个effect将会在第一个`call`执行完毕才开始。我们应该这样写：

```js

import { call } from 'redux-saga/effects';

// 正确写法，effects将会同步执行

const [users, repos] = yield[
  call(fetch, '/users'),
  call(fetch, '/repos'),
];
```

当我们需要`yield`一个包含effects的数组，generator会被阻塞直到所有的effects都执行完毕，或者当一个effect被拒绝(就像`Promise.all`的行为).

其实使用async/await时同样会有陷阱，比如:

```js
async function loadData() {
  var rel1 = await fetch(url1);
  var rel2 = await fetch(url2);
  var rel3 = await fetch(url3);
  return "whew all done";
}
```

正确的做法是:

```js
await Promise.all([fetch(url1), fetch(url2), fetch(url3)])
```

`Promise.all`将在所有的Promise变成fulfilled时，所有Promise的返回值组成一个数组，传递给`Promise.all`的回调函数。

## 在多个Effects之间启动race

```js
import { race, take, put } from 'redux-saga/effects';

function* fetchPostsWithTimeout() {
  const { post, timeout } = yield race({
    post: call(fetchApi, '/posts'),
    timeout: call(delay, 1000)
  });
  
  if(posts) 
    put({type: 'POSTS_RECEIVED', posts})
  else 
    put({type: 'TIMEOUT_ERROR'})    
}
```

`race`的另一个有用的功能是，它会自动取消那些失败的Effects。例如，假设我们有2个UI按钮：

* 第一个用于在后台启动一个任务，这个任务运行在一个无限循环的`while(true)`中。（例如，每X秒钟从服务器上同步一些数据）。
* 一旦该后台任务启动了，我们启动第二个按钮，这个按钮用于取消该任务。

```js
import { race, take, put } from 'redux-saga/effects';

function* backgroundTask() {
  while(true) { ... }
}

function* watchStartBackgroundTask() {
  while(true) {
    yield take('START_BACKGROUND_TASK')
    yield race({
      task: call(backgroundTask),
      cancel: take('CANCEL_TASK')
    })
  }
}
```

在`CANCEL_TASK` action被发起的情况下，`race` Effect将自动取消`backgrouyndTask`, 并在`backgroundTask`中抛出一个取消错误。

## 通过 `yield*` 对Sagas进行排序

可以使用内置的`yield*`操作符来组合多个Sagas, 使得它们保持顺序。用更简单的程序风格来排列macro-tasks.

```js
function* playLevelOne(getState) { ... }

function* playLevelTwo(getState) { ... }

function* playLevelThree(getState) { ... }

function* game(getState) {
  const score1 = yield* playLevelOne(getState);
  put(showScore(score1));
  
  const score2 = yield* playLevelTwo(getState);
  put(showScore(score2));
  
  const score3 = yield* playLevelThree(getState);
  put(showScore(score3));
}
```

`yield*`将导致该Javascript运行环境**漫延**至整个序列。由此产生的迭代器(来自`game()`)将`yield`所有来自于嵌套迭代器里的值。