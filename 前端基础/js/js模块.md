# js模块
最近在接触js的各种模块化机制，打算仔细的了解下js模块的部分，在medium上看到一篇不错的文章。遂翻译之，一为增强自身理解，二为有缘人能观之。


> 原文链接: [JavaScript Modules: A Beginner’s Guide](https://medium.freecodecamp.com/javascript-modules-a-beginner-s-guide-783f7d7a5fcc#.ycyaexjer)

------
如果你是一个JS的新手，经常会被一些行话弄晕，类似于"module bundlers vs. module loaders", "Webpack vs. Browserify"和" AMD vs. CommonJS"。

JS的模块系统是不友好的，但是理解它又是非常重要的。

注释：为了简明，我会分两部分来写：

* Part 1将会深入解释什么是模块，为什么要用它们。
* Part 2将会说清打包模块的意义和不同实现方法。

## part 1: 有人能解释下什么是模块嘛？
> 好的坐着会把一本书分成章节和部分；好的程序员会将程序分成模块。

好的模块是有明确的功能并且高度自控的，它允许我们需求进行移动、去除或者添加而不去破坏整个系统。

### 为什么使用模块？

在我看来，使用模块的好处主要有：

1. **可维护性(maintainability)**: 根据定义，一个模块是自控的。一个良好设计的模块目的是尽可能降低对其他代码库的依赖。当一个模块与其他代码解耦时，升级这个单独的模块会更容易。
2. **命名空间(Namespacing)**: 在js中，顶级函数(top-level function)作用域之外的变量是全局变量(意味着，每个人都可以访问它们)。正因为此，“命名空间污染”(namespace pollution)是很常见的，很多完全不相干的代码居然会共享全局变量。
3. **可复用性(Reusability)**: 坦诚的讲，我们都会复制以后写的一些代码到新的项目中。例如，让我们想象一下你把原来项目的一些通用方法复制到新项目中。

	这一切都很好，但是如果你找到了一个更好的方式来编写其中一部分代码，你必须回去并找到你在其他地方写的代码。这很浪费时间，如果你使用模块来写，我们可以很容易的复用它并修改它。

### 我们如何组织模块？
接下来我们介绍几种模块组织方式。

#### Module pattern
模块模式模仿了类的概念(因为es6之前js原生不支持类- -)，这样我们可以在一个对象中存储公有和私有方法与变量。它允许我们构建一个暴露给外部的公共API，并且封装了私有变量和方法在闭包作用域中。

这里有几种方法来实现模块模式。第一个例子中，我将使用匿名闭包。通过将我们的代码放入一个匿名函数中可以帮助我们实现目标。(记住在js中，函数是唯一一种建立新作用域的方式)

**Example 1: Anonymous closure**

```js
(function () {
  
 //我们在闭包作用域中保存私有变量
 
 var myGrades = [93, 95, 88, 0, 55, 91];
 
 var average = function() {
   var total = myGrades.reduce(function(accumulator, item) {
     return accumulator + item;
   }, 0);
   
   return 'Your average grade is' + total / myGrade.length +'.';
 }
 
 var failing = function() {
   var failingGrades = myGrades.filter(function(item) {
   return item < 70;});
   
   return 'You failed ' + failingGrades.length + ' time.';
 }
 
 console.log(failing());
}());

// 'You failed 2 times'
```

使用这种构造函数，我们的匿名函数有它自己的调用环境或者“闭包”，之后我们立即执行它。它可以隐藏变量，不污染全局命名空间。

这种方法的好处在于，您可以在此函数内部使用局部变量，而不会意外覆盖现有全局变量，但仍然访问全局变量，例如：

```js
var global = 'Hello, I am a global variable :)';

(function () {
  // We keep these variables private inside this closure scope
  
  var myGrades = [93, 95, 88, 0, 55, 91];
  
  var average = function() {
    var total = myGrades.reduce(function(accumulator, item) {
      return accumulator + item}, 0);
    
    return 'Your average grade is ' + total / myGrades.length + '.';
  }

  var failing = function(){
    var failingGrades = myGrades.filter(function(item) {
      return item < 70;});
      
    return 'You failed ' + failingGrades.length + ' times.';
  }

  console.log(failing());
  console.log(global);
}());

// 'You failed 2 times.'
// 'Hello, I am a global variable :)'
```
注意：匿名函数周围的圆括号是需要的，因为以关键字`function`开头的声明总会被认为是函数声明(记住，你不能在JavaScript中有未命名的函数声明。)因此，使用圆括号是为了创建一个函数表达式。

**Example 2: Global import**

JQuery使用的是另一种流行方法是全局导入。它类似于我们刚刚看到的匿名闭包，除了现在我们将全局变量作为参数传递：

```js
function (globalVariable) {

  // Keep this variables private inside this closure scope
  var privateFunction = function() {
    console.log('Shhhh, this is private!');
  }

  // Expose the below methods via the globalVariable interface while
  // hiding the implementation of the method within the 
  // function() block

  globalVariable.each = function(collection, iterator) {
    if (Array.isArray(collection)) {
      for (var i = 0; i < collection.length; i++) {
        iterator(collection[i], i, collection);
      }
    } else {
      for (var key in collection) {
        iterator(collection[key], key, collection);
      }
    }
  };

  globalVariable.filter = function(collection, test) {
    var filtered = [];
    globalVariable.each(collection, function(item) {
      if (test(item)) {
        filtered.push(item);
      }
    });
    return filtered;
  };

  globalVariable.map = function(collection, iterator) {
    var mapped = [];
    globalUtils.each(collection, function(value, key, collection) {
      mapped.push(iterator(value));
    });
    return mapped;
  };

  globalVariable.reduce = function(collection, iterator, accumulator) {
    var startingValueMissing = accumulator === undefined;

    globalVariable.each(collection, function(item) {
      if(startingValueMissing) {
        accumulator = item;
        startingValueMissing = false;
      } else {
        accumulator = iterator(accumulator, item);
      }
    });

    return accumulator;

  };

 }(globalVariable));
```
在这个例子中，**globalVariable**是唯一的全局变量。这种方法比匿名闭包的好处是，预先声明全局变量，使读者清楚地阅读你的代码。

**Example 3: Object interface**

另外一种创建模块的方法是使用自我控制的对象接口，例如：

```js
var myGradesCalculate = (function () {
    
  // Keep this variable private inside this closure scope
  var myGrades = [93, 95, 88, 0, 55, 91];

  // Expose these functions via an interface while hiding
  // the implementation of the module within the function() block

  return {
    average: function() {
      var total = myGrades.reduce(function(accumulator, item) {
        return accumulator + item;
        }, 0);
        
      return'Your average grade is ' + total / myGrades.length + '.';
    },

    failing: function() {
      var failingGrades = myGrades.filter(function(item) {
          return item < 70;
        });

      return 'You failed ' + failingGrades.length + ' times.';
    }
  }
})();

myGradesCalculate.failing(); // 'You failed 2 times.' 
myGradesCalculate.average(); // 'Your average grade is 70.33333333333333.'
```
正如你所看到的， 这种方法让我们决定哪些变量／方法是想保持为私有的(例如，**MyGrade**)，以及哪些 变量／方法是我们想通过`return`声明来返回并暴露的。(例如,
**average** & **failing**).

**Example 4: Revealing module pattern（译者最喜欢的）**

这种方法和例子3非常类似，它只是确保所有变量／方法保持私有直到明确的导出：

```js
var myGradesCalculate = (function () {
    
  // Keep this variable private inside this closure scope
  var myGrades = [93, 95, 88, 0, 55, 91];
  
  var average = function() {
    var total = myGrades.reduce(function(accumulator, item) {
      return accumulator + item;
      }, 0);
      
    return'Your average grade is ' + total / myGrades.length + '.';
  };

  var failing = function() {
    var failingGrades = myGrades.filter(function(item) {
        return item < 70;
      });

    return 'You failed ' + failingGrades.length + ' times.';
  };

  // Explicitly reveal public pointers to the private functions 
  // that we want to reveal publicly

  return {
    average: average,
    failing: failing
  }
})();

myGradesCalculate.failing(); // 'You failed 2 times.' 
myGradesCalculate.average(); // 'Your average grade is 70.33333333333333.'
```
这可能看起来很多，但它只是模块模式中的冰山一角，下面有一些深入的资源：

* [Learning JavaScript Design Patterns](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript)
* [Adequately Good](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html)
* [Blog of Carl Danley](https://carldanley.com/js-module-pattern)

### CommonJS and AMD
上面的方法普遍有一个常识：使用单个全局变量将其代码包装在函数中，从而使用闭包作用域创建一个私有命名空间。

虽然每种方法都有自己有效的方式，但它们有其缺点。

第一个缺点，作为一个开发人员，你需要知道正确的依赖顺序来加载文件。例如，假设你在项目中使用了`Backbone`,因此在你的文件中会包含`Backbone`源码的script标签。

然而，因为`Backbone`强依赖于`Underscore.js`, `Backbone`文件的script标签不能放在`Underscore.js`文件的script标签前面。

作为一个开发者，管理依赖并且让这些东西正确运行有时是一个非常头痛的事情。

另外一个缺点是这仍然会造成命名空间污染。比如，如果有两个模块有相同的名字怎么办？或者如果你有两个版本的模块，你会需要哪个？

可能你已经在想：我们能否设计一种方法来请求一个模块的接口，又不需要通过全局作用域？

答案是：yes.

有两种流行和良好实现的方法：CommonJS和AMD。

#### CommonJS
CommonJS是一个志愿工作组设计和实现用于声明模块的js API.

CommonJs模块本质上是一个可重复使用的js部分，它导出特定的对象，使它们可以在别的模块中`require`。如果你在Node.js中编程，你会非常熟悉这种格式。

在CommonJS中，每个js文件在其自己的唯一模块上下文中存储模块（就像将其封装在闭包中一样),在这个作用域中，我们使用`module.exports`对象来导出模块和`require`来导入模块。

当你定义一个CommonJS模块，它应该看起来像下面这样：

```js
function myModule() {
  this.hello = function() {
    return 'hello!';
  }
  
  this.goodbye = function() {
    return 'goodbye!';
  }
}

module.exports = myModule;
```
我们使用特殊的对象模块，并将我们函数的引用放入`module.exports`。这让CommonJS模块系统知道我们想要导出的内容，以便其他文件可以使用它。

接下来诱人像使用`myModule`，它可以在别的文件中`require`它，类似于下面：

```js
var myModule = require('myModule');

var myModuleInstance = new myModule();

myModuleInstance.hello();  //'hello!'
myModuleInstance.goodbye();  //'goodbye!'
```
我们之前已经讨论过这种方式与模块模式相比有两个明显的好处：

* 避免全局命名空间污染
* 明确我们的依赖

此外，CommonJS的语法也很紧凑，我很喜欢。

另一个需要注意的是，CommonJS采用服务器优先方式并同步加载模块。这是很重要的一点，如果一个文件需要`require`三个其他的模块，它会按序加载它们。

现在，这个可以在服务器端工作的很好，不幸的事，在为浏览器编写js时很难使用。只需说，从网络读取模块需要比从磁盘读取更长的时间。只要脚本加载模块正在运行，在它完成加载前它会阻塞浏览器运行其他任何东西。(我将在part 2模块捆绑时说明如何解决这个问题。)

#### AMD
CommonJS已经很好了，但是如果我们想异步加载模块该怎么办？答案是异步模块定义，简称AMD。

使用AMD加载模块如下：

```js
define(['myModule', 'myOtherModule'], function(myModule, myOtherModule) {
  console.log(myModule.hello());
});
```
`define`函数将一个模块依赖的数组作为第一个参数。这些依赖关系在后台加载(以非阻塞的方式)，并且一旦完成加载，`define`函数会调用给出的回调函数。

接下来，回调函数接收加载的依赖作为参数——在我们的例子中是`myModule`和`myOtherModule`——允许函数使用这些依赖。最后，依赖本身也必须使用`define`关键字来定义。

比如，`myModule`可能类似于下：

```js
define([], function(){
  
  return {
    hello: function() {
      console.log('hello');
    },
    goodbye: function() {
      console.log('goodbye');
    };
  };
});
```
与CommonJS不同，AMD采用了浏览器优先的方式和异步行为来完成工作。(注意，有很多人坚信，当你开始运行代码时，碎片化动态加载文件是不利的，我们将在下一部分模块构建讨论这个问题)。

除了异步性，AMD的另一个好处是你的模块可以是对象、函数、构造器、字符串、JSON以及其他类型，然而CommonJS只支持对象作为模块。

话虽如此，但是AMD不兼容io, 文件系统和通过CommonJS支持的其他面向服务器特性。AMD包装函数的语法与简单的`require`声明略显啰嗦。

#### UMD
对于需要同时支持AMD和CommonJS特性的项目，有另外一种格式:统一模块定义(UMD)

UMD本质上创建了两种方法其一，同时也支持全局变量定义。最后，UMD模块可以在客户端和服务器端工作。

下面快速了解UMD是如何工作的：

```js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      // AMD
    define(['myModule', 'myOtherModule'], factory);
  } else if (typeof exports === 'object') {
      // CommonJS
    module.exports = factory(require('myModule'), require('myOtherModule'));
  } else {
    // Browser globals (Note: root is window)
    root.returnExports = factory(root.myModule, root.myOtherModule);
  }
}(this, function (myModule, myOtherModule) {
  // Methods
  function notHelloOrGoodbye(){}; // A private method
  function hello(){}; // A public method because it's returned (see below)
  function goodbye(){}; // A public method because it's returned (see below)

  // Exposed public methods
  return {
      hello: hello,
      goodbye: goodbye
  }
}));
```
想要了解更多UMD格式的例子，请查看[enlightening repo](https://github.com/umdjs/umd)。

#### NativeJS
哦。你居然还在，我没有在这里失去你？好的，因为在我们结束之前我们还有另外一种模块定义类型。

你可能已经注意到了，上面的模块定义没有一种对于js是原生的。相反，我们已经创建了使用模块模式，CommonJS或AMD来`模拟(emulate)`模块系统的方法。

幸运的是，TC39(定义ECMAscript语法和语义标准的组织)的智者们已经在ECMAscript(ES6)中引入内置模块系统。

ES6提供了各种导入和导出模块的方法，其他人已经做了很好的工作解释 - 这里有一些资源：

* [jsmodules.io](http://jsmodules.io/cjs.html)
* [exploringjs.com](http://exploringjs.com/es6/ch_modules.html)

相比于CommonJS或者AMD，ES6模块的优点是它如何管理并提供给客户端和服务器端最好的服务：紧凑的声明语法，异步加载，在加上其他的好处，比如更好的支持循环依赖。

可能我最喜欢的ES6模块特性是导入的模块是导出模块的**实时(live)只读视图**。(相比于CommonJS这点，它导入的是导出模块的复制，因此不是实时的)。

下面是关于它们如何工作的例子:

```js
// lib/counter.js

var counter = 1;

function increment() {
  counter++;
}

function decrement() {
  counter--;
}

modules.exports = {
  counter: counter,
  increment: increment,
  decrement: decrement
};

// src/main.js

var counter = require('../../lib/cpunter');

counter.increment();
console.log(counter.counter); //1
```
在这个例子中，我们基本上做了两个复制的模块：一个是当我们导出它，一个是当我们导入它。

此外，main.js的副本现在与原始模块断开连接。这就是为什么尽管我们加了counter，但他仍然返回1——因为我们导入的counter变量是未连接的来自模块counter变量的副本。

因此，增加counter只会在模块中增加它，但不会在你的副本中增加。唯一的修改conter变量分本的方式是手动增加- -(或者让module中的函数返回module的counter值):

```js
counter.counter++;
console.log(counter.counter);
```

另一方面，ES6为我们导入的模块创建了实时可读模块：

```js
// lib/counter.js

export let counter = 1;

export function increment() {
  counter++;
}

export function decrement() {
  counter--;
}

// src/main.js
import * as counter from '../../counter';

console.log(counter.counter); //1
counter.increment();
console.log(counter.counter); //2
```
多么酷的东西啊，aha? 我发现真正引人注目的是实时只读视图是允许你将模块拆分成更小的部分，而不会失去功能。

接下来你可以将它们拆开，或者再合并，都没有问题。它都可以运行。

### Looking forward：bundling modules
Wow!时间都去哪儿？今天真是野路子，但我希望你能对js模块有更好地了解。

在下一部分我将会讲讲模块绑定，包括的核心话题：

* 为什么我们打包模块
* 不同的打包方式
* ECMAscript的模块加载API
* ...更多.   :)

注意：为了保证本文简单，我跳过了一些文章中的细节(想想循环依赖)，你可以自己去看看。