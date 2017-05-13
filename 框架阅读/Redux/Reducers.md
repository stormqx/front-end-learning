# reducer
reducer是一个接受previous state和action的纯函数，它返回下一个state.

```
(previousState, action) => newState
```

这跟传给`[Array.prototype.reduce(reducer, ?initialValue)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce?v=example)`的reducer函数很像。

## 纯函数
因为reducer是一个纯函数，所以操作数组时，不要使用`Array.prototype.push()`，应该使用`Array.prototype.concat()`【concat函数是浅拷贝，对于数组元素是对象的情况会有副作用】.

操作对象时，可以使用es6中的`[Object.assign()](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)`. 例如`Object.assign({}, state, {visibilityFilter: action.filter})`。注意`Object.assign(state, {visibilityFilter: action.filter})`是错的，它会改变第一个参数state。 此外也可以使用[object spread operator proposal](http://redux.js.org/docs/recipes/UsingObjectSpreadOperator.html), 例如` {...state, visibilityFilter: action.filter }`, 使用它需要babel进行转义。

例如，不会引起副作用的`TOGGLE_TODO`reducer代码如下:

```js
case TOGGLE_TOTO: 
  return Object.assign({}, state, {
    todos: state.todos.map((todo, index) => {
      if(index === action.index) {
        return Object.assign({}, todo, {
          completed: !todo.completed,
        });
      }
      return todo;
    })
  })
```
其实上面的写代码的过程是比较繁琐的，所以如果经常写这种类型的代码，建议使用`immutable`这种类库来简化操作。

## 分离Reducers
对于一个有意义的应用来说，将所有的更新逻辑都放入到单个reducer函数中将会使会使程序变得不可维护。 Redux提出了一个**reducer composition**概念。包含一个`combineReducers()`工具函数，它专门抽象化基于state切片的其他reducer函数的工作过程。

来看一段todoApp的reducer:

```js
function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter
      })
    case ADD_TODO:
      return Object.assign({}, state, {
        todos: [
          ...state.todos,
          {
            text: action.text,
            completed: false
          }
        ]
      })
    case TOGGLE_TODO:
      return Object.assign({}, state, {
        todos: state.todos.map((todo, index) => {
          if(index === action.index) {
            return Object.assign({}, todo, {
              completed: !todo.completed
            })
          }
          return todo
        })
      })
    default:
      return state
  }
}
```

`todos`和`visibilityFilter`是完全独立更新的。为了更好的维护将它们拆分开。

```js
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case TOGGLE_TODO:
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: !todo.completed
          })
        }
        return todo
      })
    default:
      return state
  }
}

function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter
    default:
      return state
  }
}

function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  }
}
```

我们将全局state进行切片，每个reducer管理与之对应的state部分。上面我们提到了`combineReducers()`函数，它来做上面`todoApp`中的模版逻辑部分。使用它，我们可以重写`todoApp`:

```js
import { combineReducers } from 'redux';

const todoApp = combineReducers({
  visibilityFilter,
  todos
});

export default todoApp
```

这等价于:

```js
export default function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  }
}
```

当然，你也可以使用不同的key, 例如:

```js
const todoApp = combineReducers({
  a: doSomethingWithA,
  b: processB,
});

function reducer(state = {}, action) {
  return {
    a: doSomethingWithA(state.a, action),
    b: processB(state.b, action),
  }
}
```

所以，实质上`combineReducers()`做的只是**根据你提供的key选择相应的state切片传入你提供的reducer函数中，然后结合各个reducer的结果进一个单一的对象中。**


