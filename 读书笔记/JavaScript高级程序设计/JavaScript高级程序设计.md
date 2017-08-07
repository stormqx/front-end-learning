### 变量、作用域和内存问题
基本数据类型：Undefined, Boolean, Null, Number, String.
复杂数据类型：Object.

**为什么Null是基本数据类型，typeof却返回Object?**
```js
typeof null  // object
```

在 JavaScript 最初的实现中，JavaScript 中的值是由一个表示类型的标签和实际数据值表示的。对象的类型标签是0。由于 null 代表的是空指针(大多数平台下值为0x00)，因此，null的类型标签也成为了0，typeof null就错误的返回了"object".

`==` 先转换再比较。 `===` 仅转换再比较。

**作用域链(scope chain)**的作用：保证对执行环境有权访问的所有变量和函数的有序访问。
