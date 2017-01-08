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
## Mixins
ES6发布没有任何mixin支持，所以使用ES6类来编写React是不支持mixin的，此外使用mixin会有一些问题，不要使用它。
## React Without JSX
如果你不想在构建环境中添加babel等编译器，你可以不使用JSX语法糖。使用`React.createElement(component,props, ...children)`.

## Reconciliation
普通的[生成最小操作次数的树转换方法](http://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf)复杂度为O(n^3 ).
React基于两个假设实现启发式的O(n)算法:
 
1. 不同类型的元素将产生不同的树。
2. 开发人员可以使用`key`属性指出在不同渲染中哪些元素是稳定的。

### The Diffing Algorithm
当diff两颗树时，React先根据root元素类型来比较两个root元素。

#### ELement of Different Types
当两个root元素是不同类型，React将会拆除旧树，然后从头建立一棵新树。当旧树被拆除时，旧树的DOM节点会被销毁，组件实例会调用`componentWillUnmount`函数。新树会被插入DOM中。组件实例会调用`componentWillMount`和`componentDidMount`函数。任何与旧树有关的状态会丢失。

#### DOM Element of The Same Type
当比较的两个DOM元素是相同类型的，React将会查看两者的属性，保留相同的底层DOM节点，只更新变化的属性。

#### Component Elements of The Same Type 
当一个组件更新时，组件实例是相同的，所以在不同渲染中的state被保留。React更新匹配的底层组件实例的属性，调用`componentWillReceiveProps`和`componentWillUpdate`函数。

#### Recursing On Children
默认情况下，当在DOM节点的孩子节点中递归时，React是同时在相对应的孩子节点中迭代更新变化的部分。

```js
<ul>
  <li>Duke</li>
  <li>Villanova</li>
</ul>

<ul>
  <li>Connecticut</li>
  <li>Duke</li>
  <li>Villanova</li>
</ul>
```
上面的例子会重新render所有的孩子节点，它不会意识到`<li>Duke</li>`和`<li>Villanova</li>`是应该保留的。这种不效率将成为一个问题。

#### Keys

为了解决上面的问题，React支持了一个`key `属性。当children有键值后，react会使用键值来匹配两颗树的children.

```js
<ul>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>

<ul>
  <li key="2014">Connecticut</li>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>
```
现在React就知道键值为'2014'的元素是新加的，键值为'2015'和'2016'的元素被移动了。
key属性只需要在兄弟节点中是唯一的就足够了，不需要在全局状态下唯一。

当然，如果使用数组的index作为`key`的话，只有在item没有被重排序的情况下才会高效，否则重渲染也会很慢。

#### Tradeoffs(权衡) 
现在的reconciliation算法实现，你只能表达一颗子树在它的兄弟节点中移动，但不能表达它被移动到了别处，后者会重新算然整颗树。

因为React是启发式的，如果它背后假设的条件没有得到满足，性能将会受损。

1. 算法不会试着去匹配两个不同组件类型的子树。如果你发现两个不同类型的组件有着相似的输出后，打算使用相同的类型。我们发现这并不是一个问题。
2. `key`要是稳定的、局部唯一、可预测的。如果你使用不稳定的`key`(比如`math.random()`)会造成性能损失和state丢失。(因为dom节点可能会被重新渲染)

## Context
有些时候，你打算在组件树中传数据，但又不想在每一级上使用`props`,你可以直接调用react强大的`context` API.

### Why Not to Use Context
* 如果你想要应用程序是稳定的，不要使用context。它是一个试验性的API，可能在react后版本中被废弃。
* 如果你不还熟悉状态管理库(比如[Redux](https://github.com/reactjs/redux)和[MobX](https://github.com/mobxjs/mobx))，不要使用context。对于许多实际的项目，这些库和它们对react的绑定是管理组件state的不错选择。很可能Redux是解决问题的正确方案，而不是context。
* 如果你不是一个react老司机，不要用context。使用`porps`和`state`来实现功能是更好的选择。
* 如果你还是想用context.你应该将使用context隔离到一个小区域。当API变化时更容易升级。

### How To Use Context
假设有一段下列代码：

```js
class Button extends React.Component {
  render() {
    return (
      <button style={{background: this.props.color}}>
        {this.props.children}
      </button>
    );
  }
}

class Message extends React.Component {
  render() {
    return (
      <div>
        {this.props.text} <Button color={this.props.color}>Delete</Button>
      </div>
    );
  }
}

class MessageList extends React.Component {
  render() {
    const color = "purple";
    const children = this.props.messages.map((message) =>
      <Message text={message.text} color={color} />
    );
    return <div>{children}</div>;
  }
}
```
上例中，我们按照`Button`和`Message`的顺序手动传递了`color`属性。使用`context`,我们可以通过组件树自动传递：

```js
class Buttion extends React.Component {
  render() {
    return (
      <button style={{background: this.context.color}}>
      </button>
    );
  }
}

Button.contextTypes = {
  color: React.PropTypes.string
};

class Message extends React.Component {
  render() {
    <div>
     {this.props.text}<Button>Delete</Button>
    </div>
  }
}

class MessageList extends React.Component {
  getChildContext() {
    return {color: "purple"};
  }
  
  render() {
    const children = this.props.messages.map((message) => <Message text={message.text}/>
    );
    return <div>{children}</div>;
  }
}

MessageList.childContextTypes = {
  color: React.PropsTypes.string
};
```
通过向context provider添加`childContextTypes`和`getChildContext`，react会自动向下传递信息并且子树中的任何组件都可以通过定义`contextTypes`来访问它。

如果`contextTypes`没有定义，`context`将会是空对象。

### Parent-Child Coupling
context可以建立父子组件交流的API.比如[React Router V4](https://react-router.now.sh/basic)就是以这种方式工作：

```js
const BasicExample = () => (
  <Router>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/topics">Topics</Link></li>
      </ul>

      <hr/>

      <Match exactly pattern="/" component={Home} />
      <Match pattern="/about" component={About} />
      <Match pattern="/topics" component={Topics} />
    </div>
  </Router>
)
```
通过从`Router`组件向下传递一些信息，每一个`Link`和`Match`可以和`Router`交流。(没怎么懂。 TODO：看react router源码)

### Referencing Context in Lifecycle Methods
如果组件定义了`contextTypes`,下列的生命周期方法将会接受一个`context`参数：

* `constructor(props, context)`
* `componentWillReceiveProps(nextProps, nextContext`
* `shouldComponentUpdate(nextProps, nextState, nextContext)`
* `componentWillUpdate(nextProps, nextState, nextContext)`
* `componentDidUpdate(prevProps, prevState, prevContext)`

### Referencing Context in Stateless Functional Components
无状态函数组件如果定义了`contextTypes`可以接受一个`context`参数。

```js
const Button = ({children}, context) =>
  <button style={{background: context.color}}>
    {children}
  </button>;

Button.contextTypes = {color: React.PropTypes.string};
```

react有API来更新context,但是官方文档义正严辞的强调不要使用它- - 。。。因为如果你打算从root组件中通过`setState`来改变context中的内容，然后传递变化后的值给后代组件更新后代组件。如果中间组件是`shouldComponentUpdate`返回了`false`，后代组件并不会更新。

## Higher-Order Components
HOC组件是一个函数，它接收一个组件然后返回一个新组件。

(TODO: 这块目前没接触过，先留着。)
