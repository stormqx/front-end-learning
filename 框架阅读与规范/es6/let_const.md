## let 

使用`let`和`const`声明的变量，块级作用域是存在的。

使用`let`声明的`i`, `for`循环中每一轮的变量`i`的都是重新声明的，js引擎会记住上一轮循环的值，在上一轮的基础上计算。

`for`循环有个特别之处，设置循环变量的那部分是一个父作用域，循环体内部是一个单独的子作用域。

```js
for (let i = 0; i < 3; i++) {
  let i = 'abc';
  console.log(i);
}
// abc
// abc
// abc
```

### 没有变量提升

```js
// var 的情况
console.log(foo); // 输出undefined
var foo = 2;

// let 的情况
console.log(bar); // 报错ReferenceError
let bar = 2;
```

### 暂时性死区(temporal dead zone，简称 TDZ)

```js
if (true) {
  // TDZ开始
  tmp = 'abc'; // ReferenceError
  console.log(tmp); // ReferenceError

  let tmp; // TDZ结束
  console.log(tmp); // undefined

  tmp = 123;
  console.log(tmp); // 123
}
```


```js
// 报错
let x = x;
// ReferenceError: x is not defined

x = 1
// ReferenceError: x is not defined
```

## 块级作用域

ES6 引入了块级作用域，明确允许在块级作用域之中声明函数。ES6 规定，块级作用域之中，函数声明语句的行为类似于`let，在块级作用域之外不可引用。

```js
// 浏览器的 ES6 环境
function f() { console.log('I am outside!'); }

(function () {
  if (false) {
    // 重复声明一次函数f
    function f() { console.log('I am inside!'); }
  }

  f();
}());
// Uncaught TypeError: f is not a function
```

上述代码实际运行下面代码

```js
// 浏览器的 ES6 环境
function f() { console.log('I am outside!'); }
(function () {
  var f = undefined;
  if (false) {
    function f() { console.log('I am inside!'); }
  }

  f();
}());
// Uncaught TypeError: f is not a function
```

环境导致的差异过大，避免在块级作用域内声明函数。

## const

`const`只能保证地址不可变，但是不能冻结对象。可以继续向对象添加新属性。

真想将对象冻结，使用`Object.freeze`方法。

彻底冻结。除了对象本身被冻结，对象的属性也被冻结：

```js
var constantize = (obj) => {
  Object.freeze(obj);
  Object.keys(obj).forEach( (key, i) => {
    if ( typeof obj[key] === 'object' ) {
      constantize( obj[key] );
    }
  });
};
```

## 顶层对象的属性

顶层对象，在浏览器环境指的是`window`对象，在Node指的是`global`对象。

`let`, `const`, `class`命令声明的全局变量，不属于顶层对象的属性。也就是说，从ES6开始，全局变量将逐步与顶层对象的属性脱钩。