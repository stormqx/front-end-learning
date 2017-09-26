> 此篇文章为[博客](https://github.com/mqyqingfeng/Blog)总结笔记，加强理解。

## 作用域

JavaScript采用的词法作用域，函数的作用域在函数定义的时候就决定了。与JavaScript相反的，bash是动态作用域。

## 执行上下文栈

javaScript引擎并非一行一行地分析和执行程序，而是一段一段的分析。当执行一段代码的时候，会进入一个“准备阶段”。

### 可执行代码

JavaScript中段的划分。JavaScript可执行代码(executable code)的类型有哪些？

1. 全局代码
2. 函数代码
3. eval代码

### 执行上下文栈

写的函数很多，如何管理创建的那么多执行上下文？

JavaScript引擎创建了**执行上下文栈（executable context stack）**来管理执行上下文。

模拟执行上下文栈的行为，定义执行上下文栈为一个数组：

```js
ECStack = [];
```

当JavaScript引擎开始解析执行代码的时候，最先遇到的是全局代码，所以在初始化时，先向`ECStack`栈中压入全局执行上下文，使用`globalContext`来表示它。并且只有当整个应用程序结束的时候，`ECStack`才会被清除，所以栈底永远是`globalContext`.

```js
ECStack = [
  globalContext,
];
```

假设JavaScript引擎遇到下面的代码:

```js
function fun3() {
    console.log('fun3')
}

function fun2() {
    fun3();
}

function fun1() {
    fun2();
}

fun1();
```

当执行一个函数时，会创建该函数的执行上下文，并且压入执行上下文栈(`ECStack`)中，当函数执行完毕后，就会将该函数从执行上下文栈中弹出。下面是上述代码的伪代码：

```js
// fun1
ECStack.push(<fun1> functionContext);

// fun2
ECStack.push(<fun2> functionContext);

// fun3
ECStack.push(<fun3> functionContext);

// 当fun3执行完毕
ECStack.pop();

// 当fun2执行完毕
ECStack.pop();


// 当fun1执行完毕
ECStack.pop();

// javascript接着执行下面的代码，但是ECStack底层永远有个globalContext
```

#### 思考题

思考下面两段代码的结果和函数执行上下文栈的顺序。

```js
var scope = 'global scope';
function checkScope() {
  var scope = 'local scope';
  function f() {
    return scope;
  }
  
  return f();
}

checkScope();
```

```js
var scope = 'global scope';
function checkScope() {
  var scope = 'local scope';
  function f() {
    return scope;
  }
  return f;
}
checkScope()();
```

## 执行上下文的属性

上面提到了执行上下文栈，在每个函数执行的时候创建对应的执行上下文。对于每个执行上下文，都有三个重要的属性：

1. 变量对象（Variable Object, VO）
2. 作用域链（scope chain）
3. this

## 变量对象

变量对象是与执行上下文相关的数据作用域，存储了在上下文中定义的变量和函数声明。

全局上下文的变量对象和函数上下文的变量对象有些不同。

### 全局上下文

JacaScript有一个全局对象。

> 全局对象是预定义的对象，作为 JavaScript 的全局函数和全局属性的占位符。通过使用全局对象，可以访问所有其他所有预定义的对象、函数和属性。

> 在顶层 JavaScript 代码中，可以用关键字 this 引用全局对象。因为全局对象是作用域链的头，这意味着所有非限定性的变量和函数名都会作为该对象的属性来查询。

> 例如，当JavaScript 代码引用 parseInt() 函数时，它引用的是全局对象的 parseInt 属性。全局对象是作用域链的头，还意味着在顶层 JavaScript 代码中声明的所有变量都将成为全局对象的属性。

全局上下文中的变量对象就是全局对象(浏览器端就是window)。

### 函数上下文

函数上下文中，使用活动对象(Activation Object, AO)来表示变量对象。

未进入执行阶段前，变量对象(VO)中的属性不能访问。进入执行阶段后，变量对象(VO)转化成了活动对象(AO)，里面的属性都能被访问了，然后开始进行执行阶段的操作。所以，VO和AO其实是一个对象，只是处于不同的生命周期。

### 执行过程

执行上下文的代码会分为两个阶段进行处理：分析(进入执行上下文)和执行(代码执行)。

#### 进入执行上下文

这时，变量对象包括:

1. 函数所有的形参(函数上下文)
	* 由名称和对应值组成的一个变量对象的属性被创建
	* 没有实参，属性值为undefined

2. 函数声明
	* 由名称和对应值（函数对象(function-object))组成的一个变量对象的属性被创建
	* 如果变量对象已经存在相同名称的属性(`var`声明)，则完全替换这个属性
	
3. 变量声明
	* 由名称和对应值(undefined)组成一个变量对象的属性被创建
	* 如果如果变量名称和已经声明的形参或函数相同，则变量声明不会干扰已经存在的这类属性

例如：

```js
function foo(a) {
  var b = 2;
  function c() {}
  var d = function() {};

  b = 3;

}

foo(1);
```	

```js
AO = {
  arguments: {
    0: 1,
    length: 1  
  }
  a: 1,
  b: undefined,
  c: reference to function c() {}
  d: undefined 
};
```

#### 代码执行

在代码执行阶段，会顺序执行代码，根据代码，修改变量中的值。

上面的例子在执行完成后，AO就变成了:

```js
AO = {
  arguments: {
    0: 1,
    length: 1
  }
  a: 1,
  b: 3,
  c: reference to function c() {}
  d: reference to FunctionExpression "d"
}
```

**总结:**

1. 全局上下文的变量对象初始化是全局对象
2. 函数上下文的变量对象初始化只包括Arguments对象
3. 在进入执行上下文时会给变量对象添加形参，函数声明，变量声明等初始的属性值
4. 在代码执行阶段，会再次修改变量对象的属性值

**注意点:**

```js
console.log(foo);

function foo(){
    console.log("foo");
}

var foo = 1;
```

结果会打印函数，而不是输出`undefined`。原因：在**分析阶段(进入执行上下文)**，首先会处理函数声明，其次会处理变量声明，如果变量名称与已经声明的形式参数和函数相同，则变量属性不会干扰已经存在的这些属性。

### 作用域链

分析一个函数在创建和激活时期，作用域链是如何创建和变化的。

#### 函数创建

在讲js词法作用域时，指出函数的作用域在函数定义的时候就确定了。

这时因为函数内部有一个`[[scope]]`属性，当函数创建时，就会保存所有父变量对象到其中，可以理解为``[[scope]]``是父变量对象的层级链，注意：`[[scope]]`不代表完整的作用域链。

例如:

```js
function foo() {
    function bar() {
        ...
    }
}
```

函数在创建时的`[[scope]]`为：

```js
foo.[[scope]] = [
  globalContext.VO,
]

bar.[[scope]] = [
  fooContext.AO,
  globalContext.VO,
]
```

#### 函数激活

当函数激活时，进入函数上下文，创建VO/AO后，就会将活动对象添加到作用域的前端。

这时执行上下文的作用域链为:

```js
Scope = [AO].concat([[scope]]);
```

##### 总结函数执行上下文中作用域链和变量对象的创建过程

```js
var scope = "global scope";
function checkScope() {
  var scope2 = "local scope";
  return scope2;
}
checkScope();
```

执行过程:

1. `checkScope`函数被创建，保存作用域链到内部`[[scope]]`属性：

```js
checkScope.[[scope]] = [
  globalScope.VO
];
```

2. 执行`checkScope`函数，创建`checkScope`函数的执行上下文，并被压入执行上下文栈中:

```js
ECStack = [
  checkScopeContext,
  globalContext
];
```

3. `checkScope`函数不会立即执行，而是进入分析阶段做准备工作。第一步：复制函数的`[[scope]]`属性创建作用域。

```js
checkScopeContext = {
  Scope: checkScope.[[scope]]
}
```

4. 第二步：用`arguments`创建活动对象（AO），然后初始化AO，加入形参、函数声明、变量声明。

```js
checkScopeContext = {
  AO: {
    arguments: {
      length: 0
    },
    scope2: undefined
  }
}
```

5. 第三步：将活动对象（AO）压入函数作用域链顶端：

```js
checkScopeContext = {
  AO: {
    arguments: {
      length: 0
    },
    scope2: undefined
  }
  Scope: [ AO, [[scope]] ]
}
```

6. 准备工作完成，开始执行函数。并随着函数的执行，修改AO的属性值

```js
checkScopeContext = {
  AO: {
    arguments: {
      length: 0
    }
    scope2: 'local scope'
  }
  Scope: [AO, [[Scope]]]
}
```

7. 查找到`scope2`属性，返回后函数执行完毕，将`checkScope`的执行上下文从函数执行上下文栈中弹出：

```js
ECStack = [
  globalContext
];
```