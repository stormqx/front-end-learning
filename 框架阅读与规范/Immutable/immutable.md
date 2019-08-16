> 参考资料:
> 
> * [Immutable 详解及 React 中实践](https://github.com/camsong/blog/issues/3)
> * [Immutable 结构共享是如何实现的？](https://github.com/dt-fe/weekly/issues/14)
> * [Immutable.js, persistent data structures and structural sharing](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2)
> * [dt-fe: 精读 Immutable 结构共享](https://github.com/dt-fe/weekly/blob/master/9.%E7%B2%BE%E8%AF%BB%20Immutable%20%E7%BB%93%E6%9E%84%E5%85%B1%E4%BA%AB.md)
> * [Anjana Vakil: Immutable data structures for functional JS | JSConf EU 2017](https://www.youtube.com/watch?v=Wo0qiGPSV-s)

## Immutable优缺点

React + Redux体系架构下强调函数式编程。常见的场景：组件的props是不可变的, reducer是纯函数... 所以在没有使用Immutable的时候，我们在`reducer`函数中会经常使用`Object.assign`方法.

### `Object.assign`的缺点

1. 复杂的`reducer`函数写起来很费劲

使用`immutable.js`的实现方式:

```js
function toggleTodo(todos, id) {
  return todos.update(id,
    (todo) => todo.update('completed',
      (completed) => !completed
    )
  )
}
```

使用`Object.assign`的实现方式:

```js
function toggleTodo(todos, id) {
  return Object.assign({}, todos, {
    [id]: Object.assign({}, todos[id], {
      completed: !todos[id].completed
    })
  })
}
```

2. 海量数据下效率不高。

因为`Object.assign`进行的是浅拷贝，所以海量数据下拷贝效率不高。

### Immutable带来的好处

顾名思义, 对Immutable对象的任何修改或者添加删除操作都会返回一个新的Immutable对象 。Immtutable实现的原理是 `Persistent Data Structure（持久化数据结构）`，就是**使用旧数据创建新数据时，要保证旧数据同事可用且不变。** 为了避免deepCopy把所有阶段都复制一遍带来的性能消耗，Immutable使用了`Structural Sharing（结构共享）`, 就是**如果对象树中一个节点发生变化，只修改这个节点和受它影响的父节点，其他节点则进行共享。**


1. 使回溯变得非常容易。 `undo/redo, copy/paste`
2. 节省内存。使用了`structural sharing（结构共享）`
3. 并发安全。虽然javascript还是单线程运行...
4. 拥抱函数式编程。

### Immutable缺点

1. 学习成本
2. 增加资源文件大小
3. 容易混淆
4. 会引起一系列的改动。比如react项目中使用了`immutable.js`，如果你想使用`combineReducers`就要用`redux-immutable`。

## persistent data structure

实现的具体原理: **tree🌲 and sharing🌟.**. 


### 概念一： path copying
 变🐌为🚀。 
 
 主要思想： 只改变 根节点 -> 改变过的叶子节点 这条路径上的节点。
 
 
### 概念二： structural sharing
变🐘为🐭。

这个`tree`被称为TRIE tree（字典树🌲）.**叶子代表value, 路径代表key.**

TRIE tree最常见的是每个节点有32个分支。当树越宽（子节点越多）时，树高会下降，查询效率会增加， 更新效率会下降（极限情况下，相当于线性结构）。为了**查询和更新的平衡**，选择了32位。

* array使用index进行。 **Bitmapped Vector trie**
* object的做法：hash the key to get a number descend trie。 **Hash Array Mapped Trie**
 