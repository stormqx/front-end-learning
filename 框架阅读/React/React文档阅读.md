#QUICK START

##JSX延展属性

我们可以使用延展属性，将一个对象所有的属性复制到另一个对象上。我们可以多次使用，或者和普通的属性一起用，不过要注意顺序，后面的会覆盖前面的。这是React直接支持的。

```js
var props = {foo:"check"}
var component = <Component {...props} foo='name'/>
console.log(component.props.foo);
//name
```
其实ES6中的扩展运算符，只适用于部署了Iterator接口的对象。这里是React做了处理。

##state异步更新
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

##The Data Flows Down

所谓的单向数据流是指，任何state总是由一些特定组件拥有，并且从该state派生的任何数据或UI只能影响"树下面"的组件。

##Handling Events

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

##Prevent Component from Rendering
有时候尽管一个组件被渲染，你可能还是想隐藏它，这种情况下你可以通过返回null来代替原来的渲染结果。

##List and Key
当创建List元素时，我们需要包含一个唯一字符串标识的key属性。Key可以帮助React识别哪些元素被改变、添加或移除。如果没有stable IDs我们可以使用index作为key。但是并不推荐这样做，因为它会[变慢](https://facebook.github.io/react/docs/reconciliation.html#recursing-on-children)。

Key并不需要全局唯一，当生成两个不同的数组时可以使用相同的key值。Key值只是为React服务并不会通过组件传递，如果在组件里面同学需要这些值，你应该使用其他名字传props.
##Form
### 可控组件
将用户输入操作和`setState()`相结合,让React state成为‘single source of truth‘，这样渲染表单的React组件还可以控制后续用户的输入时表单发生的情况。这类组件称为可控组件。

`input`, `textarea`, `select`都可以接受`value`属性来实现可控组件。

在HTML中，textarea的值被定义在标签中间，React中则定义在value上。

`select`标签中可以添加`option`标签实现下拉菜单，其中所选项不是在`option`标签中设置`selected`，而是在`select`根标签设置`value`值。这在可控组件中更方便的，只需要在一个地方进行更新操作。

### 不可控组件
在可控组件中，我们需要为数据可能更改的每种方式都要编写事件处理程序，并且组件要管理所有的输入state。当我们把已存在的代码转换成React或者React应用程序与非React库集成时，可控组件会很麻烦。

在不可控组件中，数据处理交给DOM本身而不是React组件。不为每个state变化写事件处理，而是使用[ref](https://facebook.github.io/react/docs/refs-and-the-dom.html)从DOM中获得数据。

实际上，不可控组件类似于传统HTML表单输入，它会记住你所输入的，可以使用ref获得值。组件有`defaultValue`属性来满足不可控组件的默认值。

```js
class Form extends Component {
  handleSubmitClick = () => {
    const name = this._name.value;
    // do something with `name`
  }

  render() {
    return (
      <div>
        <input type="text" ref={input => this._name = input} />
        <button onClick={this.handleSubmitClick}>Sign up</button>
      </div>
    );
  }
}
```

**不可控组件，当你需要数据时，你必须自己把数据pull下来。**

**可控组件，是将数据改变push到表单组件中，所以可以实时改变**。  [link](http://goshakkk.name/controlled-vs-uncontrolled-inputs-react/)

##Lifting State Up
如果某些组件会对相同的数据变化做出响应，推荐将共享的state提到离他们最近的祖先上。

##Composition vs Inheritance
###Containment
类似于`Sidebar`和`Dialog`这类组件事先不知道子组件是很普通的。可以使用`children` prop直接将子组件输出。

更少见的情况，有时你在一个组件内部需要多个'holes'来填充内容。这种情况下，我们将子组件作为属性进行传递。

```js
function SplitPane(props) {
  return (
    <div className="SplitPane">
      <div className="SplitPane-left">
        {props.left}
      </div>
      <div className="SplitPane-right">
        {props.right}
      </div>
    </div>
  );
}

function App() {
  return (
    <SplitPane
      left={
        <Contacts />
      }
      right={
        <Chat />
      } />
  );
}
```

我们可以通过向组件传递属性来达到继承的效果，使用组合代替继承更具有灵活性。

#Advanced Guide
##JSX in depth
JSX tags被编译成有名变量的直接引用，所以如果要使用 `<Foo/>` tag, `<Foo/>` tag必须在作用域中。

如果一个module导出了很多个React组件，可以方便的使用点符号来使用React组件。

```js
import React from 'react';

const MyComponents = {
  DatePicker: function DatePicker(props) {
    return <div>Imagine a {props.color} datepicker here.</div>;
  }
}

function BlueDatePicker() {
  return <MyComponents.DatePicker color="blue" />;
}
```

JSX tag类型不能是表达式,如果需要接受表达式的值，将值存入一个大写变量:

```js
const components = {
  photo: PhotoStory,
  video: VideoStory
};

function Story(props) {
  // Wrong! JSX type can't be an expression.
  return <components[props.storyType] story={props.story} />;
}

function Story(props) {
  // Correct! JSX type can be a capitalized variable.
  const SpecificStory = components[props.storyType];
  return <SpecificStory story={props.story} />;
}
```
###Props in JSX
如果props的类型是string的话，加不加`{}`是等价的。如果一个prop没有给定值，则默认值为`true`。但是最好不要这么做，因为这与[ES6 object shorthand](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Object_initializer#New_notations_in_ECMAScript_2015)冲突，ES6中`{foo}`是`{foo: foo}`的缩写，而不是`{foo: true}`的缩写。

###Boolean，Null and Undefined Are Ignored

```js
<div />

<div></div>

<div>{false}</div>

<div>{null}</div>

<div>{true}</div>
```
有些"false" values还是会被React渲染的。比如props.messages是一个空数组的话，0是会被渲染的。

```js
<div>
  {props.messages.length &&
    <MessageList messages={props.messages} />
  }
</div>
```
所以确保`&&`前面的表达式是boolean类型的。

```js
<div>
  {props.messages.length>0 &&
    <MessageList messages={props.messages} />
  }
</div>
```
如果需要在输出中显示`boolean`,`null`,`undefined`这些值的话，要把它们转成字符串，`String('false')`。

##The ref Callback Attribute
`ref`属性接收一个回调函数，回调函数会在组件mounting或者unmounting之后被立即执行。

* 当`ref`属性被用于HTML元素中，`ref`回调函数接收底层的DOM元素作为它的参数。**使用`ref`回调函数可以存储一个DOM元素的引用**。
* 当`ref`属性被用于自定义组件时，`ref`回调函数接收mounted的组件实例作为它的参数。

##Optimizing Performance
使用生产环境构建，对于Webpack来说，在生产config文件中添加插件。因为在开发环境构建包括了一些帮助写app的warning。

```js
new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify('production')
  }
}),
new webpack.optimize.UglifyJsPlugin()
```
##Avoid Reconciliation
合理使用`shouldUpdateComponent()`,如果知道某些情况下不需要更新组件，可以在`shouldUpdateComponent()`中返回`false`，这样可以跳过整个render过程。
##shouldComponentUpdate In Action
![should-component-update.png
](image/should-component-update.png)
上图是一棵组件树，`SCU`表示`shouldComponentUpdate`的返回值，`vDOMEq`表示要渲染的组件是否发生变化。圆圈的颜色表示组件是否reconciled。

* 由于C2的`shouldComponentUpdate`返回`false`，所以React不会试着渲染C2,因此也不会调用C4和C5的`shouldComponentUpdate`.
* 对于C1和C3，`shouldComponentUpdate`返回`true`,因此React要向下检查它们的叶子，对于C6的`shouldComponentUpdate`返回`true`并且`vDOMq`为`false`，所以React会更新DOM。
* 对于C8来说，`SCU`和`vDOMq`都为`true`,所以React不会更新它。

对于简单数据结构，我们大多数情况下可以使用`React.PureComponent`来替代自己写的`shouldComponentUpdate`.它仅仅做shallow comparison。所以如果`props`或者`state`是复杂数据结构的话，我们就不能使用它。比如下例中的`state.words`为数组，使用`push`操作来更新数组，shallow comparison是无法识别的。

```js
class ListOfWords extends React.PureComponent {
  render() {
    return <div>{this.props.words.join(',')}</div>;
  }
}

class WordAdder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      words: ['marklar']
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    // This section is bad style and causes a bug
    const words = this.state.words;
    words.push('marklar');
    this.setState({words: words});
  }

  render() {
    return (
      <div>
        <button onClick={this.handleClick} />
        <ListOfWords words={this.state.words} />
      </div>
    );
  }
}
```

##The Power of Not Mutating Data
最简单的方式是我们在使用`props`或者`state`时使用不可变数据，比如修改上例中的`handleClick()`方法:

```js
handleClick() {
  this.setState(prevState => ({
    words: prevState.words.concat(['marklar'])
  }));
}
```
但是有一个缺点:`Array.prototype.concat`是浅拷贝（只会将对象的各个属性进行依此复制，不会进行递归复制），对于对象引用来说，所有原数组和新数组中的对象引用都指向同一个实际的对象，当实际的对象被修改时，两个数据同时被修改.

ES6的写法:

```js
handleClick() {
  this.setState(prevState => ({
    words: [..prevState.words, 'marklar'],
  }));
}
```

对于对象的属性发生改变的情况，同样有解决办法。比如我想修改`colormap.right`为`'blue'`：

```js
function updateColorMap(colormap) {
  colormap.right = 'blue';
}
```

为了不修改原始对象，我们使用[Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)方法：

```js
function updateColorMap(colormap) {
  return Object.assign({}, colormap, {right: 'blue'});
}
```

还有一个js提案是关于对象扩展运算符的,它也可以解决对象不改变的情况：

```js
function updateColorMap(colormap) {
  return {...colormap, right: 'blue'};
}
```
##Mixins
ES6发布没有任何mixin支持，所以使用ES6类来编写React是不支持mixin的，此外使用mixin会有一些问题，不要使用它。
##React Without JSX
如果你不想在构建环境中添加babel等编译器，你可以不使用JSX语法糖。使用`React.createElement(component,props, ...children)`.