#JSX延展属性

我们可以使用延展属性，将一个对象所有的属性复制到另一个对象上。我们可以多次使用，或者和普通的属性一起用，不过要注意顺序，后面的会覆盖前面的。这是React直接支持的。

```js
var props = {foo:"check"}
var component = <Component {...props} foo='name'/>
console.log(component.props.foo);
//name
```
其实ES6中的扩展运算符，只适用于部署了Iterator接口的对象。这里是React做了处理。

#state异步更新
React为了性能可以将多个`setState()`	批处理为一个更新。

因为`this.props`和`this.state`可能是异步更新，所以不应该依赖它们的值来计算下一个state。

```js
//wrong,有可能不会更新
this.setState({
  counter: this.state.counter + this.props.increment
});
```

通过`setState()`接受一个函数而不是一个对象来解决这个问题，这个函数将会接受上一次state作为一个参数，更新时的props作为第二个参数.

```js
//correct
this.setState(function(prevState, props){
  counter: prevState.counter + props.increment
});
```

#The Data Flows Down

所谓的单向数据流是指，任何state总是由一些特定组件拥有，并且从该state派生的任何数据或UI只能影响"树下面"的组件。

#Handling Events

React元素的处理事件和DOM元素的处理事件有一些语法上的区别：

* React事件是驼峰命名规则。
* JSX传递函数作为事件处理程序，而不是一个字符串
* React不能通过返回false来阻止默认行为。你必须明确的使用`e.preventDefault()`.

其中 **e** 是一个合成事件，react根据W3C标准来定义这些合成事件，不需要考虑跨平台兼容性。

React维护一个事件池，这意味着合成事件将会被重用。在事件回调被调用后，**合成事件**对象所有属性将会被置为null。这种情况下，无法通过异步方法来访问该事件。如果需要异步访问，需要调用`event.persist()`，它会从事件池中移除合成事件，允许用户保存事件引用。[详情戳这里](https://facebook.github.io/react/docs/events.html#event-pooling).

js中类方法不会默认绑定，如果忘记绑定传递给`onClick`事件的`this.handleClick`，当函数实际被调用时`this`将变成`undefined`.**通常情况下，如果一个方法后面没有(),即`onClick={this.handleCilck}`这种类型，你就应该绑定该方法**。当然如果你嫌手动绑定麻烦，你也可以这么写：

* `handleClick = () => {console.log('this is, this);}`
* `<button onClick={e => this.handleClick(e)}/>   handleClick() {console.log('this is', this);}`

第二种写法的问题是每次button创建时都会产生不同的回调函数，如果回调函数会向下面的部件传递props时，这些组件可能会做额外的再渲染。建议在构造函数中绑定解决这类性能问题。

#Prevent Component from Rendering
有时候尽管一个组件被渲染，你可能还是想隐藏它，这种情况下你可以通过返回null来代替原来的渲染结果。

#List and Key
当创建List元素时，我们需要包含一个唯一字符串标识的key属性。Key可以帮助React识别哪些元素被改变、添加或移除。如果没有stable IDs我们可以使用index作为key。但是并不推荐这样做，因为它会[变慢](https://facebook.github.io/react/docs/reconciliation.html#recursing-on-children)。

Key并不需要全局唯一，当生成两个不同的数组时可以使用相同的key值。
