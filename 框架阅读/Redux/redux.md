# redux

## 动机

### 动机一：管理持续变化的状态是困难的

如今前端开发SPA盛行，**我们管理着比以前多得多的状态**。 

这些状态包括:

* 来自服务器的响应
* 缓存的数据
* 前端组件之间的通信的状态
* 在本地产生还未持久化到服务器的状态
* UI相关的状态。比如路由信息，分页控制等等...

管理这种变化的状态是困难的。试想下这样一个场景：**如果一个model可以更新另外的model。当有一个view更新了一个model, 这个model会更改另外一个model。反过来，有可能会更新另外一个view.** 到某个临界点，你不再理解app发生了什么。因为你**失去了对state的控制(when, why, how)**。

> 当一个系统变得**不透明**和**不确定**。它就很难重现bug和添加新的features.


### 动机二：人类很难处理好的两个概念：可变(mutation)和异步(asynchonicity)

前端发展迅猛。各种新名词：乐观更新，服务器渲染（SSR），路由切换前获取数据等等。 我们发现我们管理起来比以往任何时候都要复杂。 这后面的原因我认为就是:**可变(mutation)和异步(asynchonicity)**。将它们混在一起会让人非常痛苦。

所以react尝试着解决一些问题：React在设计view层时移除了异步行为。你在`render`函数中不能做异步行为或者任何破坏`render`的操作。

**它在view层（`render`函数）试着移除异步和直接操纵DOM。** 所以react把管理状态这件事交给你自己来处理, 这时可以交给redux来处理。 *这就是Redux要做的事情： 让状态变化可预测。*	


## 三个原则

* **单一数据源**。 整个应用的state存储在一个store中的对象树🌲中。
* **状态是只读的**。 改变状态的唯一方法就是发送一个action，这个action描述了发生的行为。
* **通过纯函数来改变**。 通过pure reducer来解决。


##  解读Redux源码

redux源码主要提供的函数有：

```js
applyMiddleware()
combineReducers()
compose()
createStore()
getState()
dispatch()
subscribe()
replaceReducer()
...
```

其中`applyMiddleware`和`compose`函数在applyMiddleware.md文件中已经解释。 `combineReducers`在reducers.md文件中也已说明。

### createStore

接下来主要分析`createStore`函数的实现。

`createStore`的函数签名: `createStore(reducer, preloadedState, enhancer)`。

* `reducer`函数是redux的精髓，根据当前的状态树和action的信息执行返回下一阶段的状态🌲。
* `preloadedState`，顾名思义，初始化的状态信息。
* `enhancer`，通常使用`applyMiddleware`来天高redux的能力。


接下来是一段判断输入参数的代码。可以不提供`preloadedState`参数而将第二项设置为`enhancer`函数.

```js
if(typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
  enhancer = preloadedState;
  preloadedState = undefined;
}

if(typeof enhancer != 'undefined') {
  if(typeof enhancer != 'function') {
    throw new Error('Expected the reducer to be a function');
  }
  return enhancer(createStore)(reducer, preloadedState);
}

if(typeof reducer !== 'function') {
  throw new Error('Expected the reducer to be a function');
}
```

过完了前戏，现在我们进入正题。

```js
let currentReducer = reducer;
let currentState = preloadedState;
let currentListeners = [];
let nextListeners = currentListeners;
let isDispatching = false;

function ensureCanMutableNextListeners() {
  if(nextListeners === currentListeners) {
    nextListenders = currentListeners.slice();
  }
}
```

毫无疑问，redux中的变量当然通过闭包的形式来访问的呀。来保证唯一性啦啦啦。

`ensureCanMutableNextListeners `的作用我们后面再介绍。

接下来是`getState`函数:

```js
function getState() {
  return currentState;
}
```

```js
/*
*
* @param {Function} listener A callback to be invoked on every dispatch.
* @returns {Function} A function to remove this change listener.
*/
function subscribe(listener) {
  if(typeof listener !== 'function') {
    throw new Error('Expected listener to be a function')
  }
  
  let isSubscribed = true
  
  ensureCanMutateNextListeners()
  nextListeners.push(listener)
  
  return function unsubscribe() {
    if(!isSubscribed) {
      return
    }
    
    isSubscribed = false
    
    ensureCanMutateNextListeners()
    const index = nextListeners.indexOf(listener)
    nextListeners.splice(index, 1)
  }
}
```

redux维护了两个listener数组，`currentListeners`和`nextListeners`。其中进行`notify`操作的是`currentListeners`数组，对listener进行添加／删除的是`nextListeners`。然后在合适的时机将`nextListeners`赋值给`currentListeners`


redux基本的实现只支持普通对象action，所以你想dispatch一个promise, observable等等，应该自己编写`middleware`来增强`dispatch`函数。

```js
／*
 * @param {Object} action A plain object representing “what changed”. It is
* a good idea to keep actions serializable so you can record and replay user
* sessions, or use the time travelling `redux-devtools`. An action must have
* a `type` property which may not be `undefined`. It is a good idea to use
* string constants for action types.
*
* @returns {Object} For convenience, the same action object you dispatched.
*
*／

function dispatch(action) {
	if (!isPlainObject(action)) {
	  throw new Error(
	    'Actions must be plain objects. ' +
	    'Use custom middleware for async actions.'
	  )
	}
	
	 if (typeof action.type === 'undefined') {
	  throw new Error(
	    'Actions may not have an undefined "type" property. ' +
	    'Have you misspelled a constant?'
	  )
	}
	
	if (isDispatching) {
	  throw new Error('Reducers may not dispatch actions.')
	}
	
	try {
	  isDispatching = true;
	  currentState = currentReducer(currentState, action)
	} finally {
	  isDispatching = false;
	}
	
	const listeners = currentListeners = nextListeners
	for(let i = 0; i < listeners.length; i++) {
	  const listener =listeners[i]
	  listener()
	}
	
	return action
}
```

`dispatch`函数根据`isDispatching`标志来保证一次只能有一个action被reducer，有种单线程的感觉。。。

在每次进行`notify`操作的时候，redux都会将`nextListeners`传递给`currentListeners`，这样能保证listeners的及时性，同时又尽可能的减少listeners浅拷贝的操作次数，**也就是说，只有当listeners会发生变化时（`push`或者`splice`），才会进行`slice`操作，将`nextListeners`中的listeners浅拷贝到`currentListeners`中。**


下面的是`replaceReducer`函数的源码，没什么好分析的，就是将当前的`currentReducer`替换成`nextReducer`.

这个函数的主要应用场景: 

1. 实现了code splitting的代码，想要动态的加载部分的reducers.
2. 实现redux的hot reloading机制。

```js

/**
* Replaces the reducer currently used by the store to calculate the state.
*
* You might need this if your app implements code splitting and you want to
* load some of the reducers dynamically. You might also need this if you
* implement a hot reloading mechanism for Redux.
*
* @param {Function} nextReducer The reducer for the store to use instead.
* @returns {void}
*/

function replaceReducer(nextReducer) {
  if( typeof nextReducer !== 'function') {
    throw new Error('Expected the nextReducer to be a function')
  }
  
  currentReducer = newReducer
  dispatcher({ type: ActionTypes.INIT })
}
```

接下来是`observable`函数，这部分暂时没有接触过，先不做不分析。

```js
/**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }
```

最后一部分，`dispatch`一个redux的内部事件，初始化state tree。

返回所有暴露给外部的函数。

```js
dispatch({ type: ActionTypes.INIT })

return {
  dispatch,
  subscribe,
  getState,
  replaceReducer,
  [$$observable]: observable
}
```

## 总结

总的来说，redux就是一个 pub/sub模式 + reducer 的结合。通过单例模式保证单一数据源，通过`reducer`的函数式编程的思想来更新数据。 通过pub/sub模式执行`notify`过程。

redux利用了js的模块模式，通过闭包的形式访问内部变量，`currentListeners`, `nextListeners`, `isDispatching`, `currentReducer`, `currentStore`，通过`return`只暴露出自己想暴露的函数。

redux的`createStore`函数使用了单例模式，通过闭包来访问`currentStore`, 保证了`currentStore`的唯一性。

redux将listeners分为`currentListeners`和`nextListeners`符合**单一职责原则**。

* `currentListeners`用来响应`dispatch`操作，进行`notify`操作。 在`notify`之前，使用`currentListeners = nextListeners`进行更新listeners操作。
* `nextListeners`用来进行对listeners数组进行增加(`push`)／删除(`indexOf`后`splice`)操作。在每次对listeners数据进行操作前，调用`ensureCanMutableNextListeners`(调用`Array.slice()`进行浅拷贝)，保证不会影响`currentListeners`的数据。
*  通过上面两个策略，可以减少浅拷贝的次数，而且**单一职责原则**让逻辑更加清晰。岂不是美滋滋。。。








