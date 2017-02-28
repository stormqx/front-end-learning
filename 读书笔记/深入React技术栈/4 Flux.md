# MVC/MVVM

![images/MVC模型.png](images/MVC模型.png)

上图为经典的MVC模型。

* **Model**：负责保存应用数据，和后端交互同步应用数据，或者校验数据。
* **View**: 对应js模版语言，React具备这一特性。
* **Controller**: 负责连接View和Model，Model的任何改变都会应用到View中，View的操作会通过Controller应用到Model中。 Controller管理了应用程序中Model和View之间的逻辑和协调。

## MVVM的演变
MVVM关键“改进”在于数据绑定。View的数据状态发生变化可以直接影响VM，反之亦然。

![images/MVVM模型.png](images/MVVM模型.png)

## MVC的问题
MVC的问题是：随着项目变大，逻辑变复杂，混乱的数据流动方式。

解决方案：如果渲染函数只有一个，统一放在Controller中，每次更新重渲染页面，这样的话，任何数据的更新都只用调用重渲染就行，并且数据和当前页面的状态是唯一确定的。这样可以保证数据的流动清晰。然而重渲染会带来严重的性能和用户体验问题。

# Flux的解决方案
讲道理这货应该叫ADSV（Action Dispatcher Store View）.Flux的核心思想是:**数据和逻辑永远单向流动。** 强调单向数据流，强调谨慎可追溯的数据变动。在Flux应用中，数据从Action到Dispatcher，再到Store,最终到View的路线是单向不可逆的。

![images/Flux模型.png](images/Flux模型.png)

Flux的dispatcher定义了严格的规则来限定对数据的修改操作，Store中不能暴露setter的设定也强化了数据修改的纯洁性，保证了Store的数据确定应用唯一的状态。

Flux的每次view渲染都是**重渲染**，但是对性能影响不大，因为它重渲染的是Virtual DOM, 并且PureRender可以保障从重渲染到局部渲染的转换。

## Flux基本概念

* **dispatcher**: 负责分发事件；
* **store**：负责保存数据，同时响应事件并更新数据了；
* **view**：负责订阅store中的数据，使用这些数据渲染页面；
* **controller-view**：负责将view与store进行绑定。

### dipactcher与action

Flux中的事件会由若干个中央处理器来进行分发，就是dispatcher.核心的API有`register()`和`dispatch()`。`register()`用来注册一个监听器，`dispatch()`用来分发action.

action就是普通的JavaScript对象，一般包含type, payload等字段，描述一个事件和需要改变的相关数据。

### store

store会调用dispatcher的`register()`方法将自己注册为一个监听器。每当使用dispatcher的`dispatch()`方法分发一个action时，store注册的监听器会被调用，同时得到这个action作为参数。

此外，Flux中store对外只暴露`getter`而不暴露`setter`,这意味着在store外只能读取store中的数据而不能做任何修改。

### controller-view

controller-view是整个应用的最顶层view, 这里不会涉及具体的业务逻辑，主要进行store与React组件(即view层)之间的绑定，定义数据更新及传递的方式。

controller-view会调用store暴露的`getter`方法获取存储其中的数据并设置为自己的state,在render的时候以props的形式传给自己的子组件(this.props.children).

### view

Flux有一个特殊的约定：如果洁面操作需要修改数据，则必须使用dispatcher分发一个action.

### actionCreator

使用actionCreator的原因是在很多时候，分发action的代码是冗余的。例如分发一个下面的action:

```js
{
  type: 'CLICK_UPVOTE',
  payload: {
    weiboId: 123,
  }
}
```
包含完整分发逻辑的代码更复杂：

```js
import appDispatcher from '../dispatcher/appDispatcher';

//响应点赞的onClick方法

handleClickUpdateVote(weiboId) {
  appDispatcher.dispatch({
    type: 'CLICK_UPVOTE',
    payload: {
      weiboId: 123,
    }
  })
}
```
在分发action的6行代码里面，只有1行是变化的。所以创建一个actionCreator减少冗余代码，方便重用逻辑,这是软件工程的基本思想：

```js
//actions/AppAction.js
import appDispatcher from '../dispatcher/appDispatcher';

function upvote(weiboId) {
	appDispatcher.dispatch({
		type: 'CLICK_UPVOTE',
		payload: {
		  weiboId: 123,
		}
	})
}


//components/weibo.js

//响应点赞的onClick方法
handleClickUpdateVote(weiboId) {
  upvote(weiboId);
}






