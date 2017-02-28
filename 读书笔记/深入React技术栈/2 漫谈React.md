# 事件系统
关于事件系统一些基本的知识在`react文档阅读`中已经谈到，这里不再赘述。

React并不会像DOM0级事件那样将事件处理器直接绑定到HTML元素上。React知识借鉴了这种写法。

## 合成事件的实现机制

### 事件委派

React不会把事件处理函数直接绑定到真实的节点上，而是把所有事件绑定到结构的最外层，使用一个统一的事件监听器。这个事件监听器维持了一个映射来保存所有组件内部的事件监听和处理函数。当组件挂载或卸载时，只是在统一的事件监听器上插入或删除一些对象；当事件发生时，首先被统一的事件监听器处理，然后在映射里找到真正的事件处理函数并调用。

### 自动绑定

在React组件中，每个方法的上下文都会指向该组件的实例。React还会对这种引用进行缓存，以达到CPU和内存的最优化。注意：在ES6 classes 或者纯函数时，自动绑定不复存在，需要手动实现this绑定。


### 合成事件与原生事件混用

还是有很多应用场景只能借助原生事件的帮助才能完成。例如，在web页面中添加一个使用移动设备扫描二维码的功能，在点击按钮时显示二维码，点击非二维码区域将其隐藏起来。

```js
/**
 * Created on 26/02/2017.
 */

import React from 'react';

export default class Qrcode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false
    }
  }

  componentDidMount() {
    document.body.addEventListener('click', () => {
      this.setState({
        active: false
      })
    });
  }

  componentWillUnmount() {
    document.body.removeEventListener('click');
  }


  handleClick = (e) => {
    e.stopPropagation();
    this.setState({
      active: !this.state.active
    })
  }

  handleClickQr = (e) => {
    e.stopPropagation();
  }


  render() {

    return (
      <div className="qr-wrapper">
        <button className="qr" onClick={this.handleClick}>二维码</button>
        <div style={{ display: this.state.active ? 'block' : 'none'}} onClick={this.handleClickQr}>
          <img className="code" src="100.jpeg" alt="头像哈哈哈,其实不是Qrcode"/>
        </div>
      </div>
    );

  }
}
```

上述代码的逻辑很简单，点击按钮可以切换二维码的显示和隐藏，在按钮外的区域同样可以达到隐藏的效果，而点击Qrcode不会发生变化。**我们无法在组件中将事件绑定到body上，因为body在组件范围之外，只能使用原生事件绑定事件来实现。**

当时实际效果不是这样的呀！！！我点击二维码区域时二维码还是会隐藏。点了button显示后不会隐藏。原因很简单，就是React合成事件系统的委托机制，在合成事件内部只对最外层的容器进行了绑定，并且依赖事件的冒泡机制来完成委托。所以，事件没有绑定到div.qr元素和button元素上，`e.stopPropagation()`是没用的。

解决方案：

* 不要将合成事件与原生事件混用。比如：

```js
componentDidMount() {
    document.body.addEventListener('click', () => {
      this.setState({
        active: false
      })
    });

    document.querySelector('.code').addEventListener('click', e => {
      e.stopPropagation();
    })
  }
```

阻止React事件冒泡的行为只能用于React合成事件系统中，且没办法阻止原生事件的冒泡。反着，在原生事件中的阻止冒泡行为，却可以阻止React合成事件的传播(why?).

# 组件间通信

* 父组件向子组件通信：props
* 子组件向父组件通信：
  * 利用回调函数。
  * 利用自定义事件机制。（例如pub/sub)
* 跨级组件通信：context
* 无嵌套关系的组件通信：
 常见的有pub/sub模式。注意在componentDidMount事件中，如果组件挂载完成，再订阅事件；当组件卸载的时候，在componentWillUnmount事件中取消事件的订阅。
 
# 组件间抽象
## 使用mixin
mixin实际效果类似于Java的interface，都是为了创造一种*类似多重继承*的效果。下面我们自己封装一个mixin方法来感受一下：

```js

const mixin = function(obj, mixins) {
  const newObj = obj;
  newObj.prototype = Object.create(obj.prototype);
  
  for(let prop in mixins) {
    if(mixins.hasOwnProperty(prop)) {
      newObj.prototype[prop] = mixins[prop];
    }
  }
  
  return newObj;
}

const BigMixin = {
  fly: () => {
    console.log('fly');
  }
};

const Big = function() {
  console.log('new big');
}

const FlyBig = mixin(Big, BigMixin);

const flyBig = new FlyBig();  // 'new big'
flyBig.fly();  // 'i can fly'
```

## 使用高阶函数
TODO：这里目前没看懂。