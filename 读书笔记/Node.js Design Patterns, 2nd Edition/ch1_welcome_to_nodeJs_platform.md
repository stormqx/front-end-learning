# node.js哲学
## 小内核(small core)

小内核意味着有更大的自由度，这对社区实践和快速迭代新功能有很大的帮助。

## 小模块(small modules)

主要遵循了Unix哲学：

> "Small is beautiful."
> "Make each program do one thing well."

node的`npm`(官方包管理工具)贯彻了这一理念。在npm包中，我们不难找出一些少于100行代码的`module`。编写`module`应该考虑下面这些因素：

> easier to understand and use
> simpler to test and maintain
> perfect to share with the browser

这是关注`Don't Repeat Yourself(DRY)`原则。

## 少对外暴露(small surface area)

除了**作用域(scope)**和**体积(size)**保持小之外，node.js的模块通常也有**暴露最小集合的功能API**的特点。在大多数情况下，我们的用户只会关注一些重要的基本特性，而不是过于定制化的高级特性。

很多node.js `module`的另外一个特点是**它们是拿来直接用的而不是为了扩展**。这听起来不灵活。但实际上它具有减少用例，简化实现，便于维护，提高可用性的优点。

## 简单且实用(simplicity and pragmatism)

> Keep it simple, stupid(KISS)

现实世界就是不完美且复杂的。我们需要思考的是在合理的复杂度下，让软件能够很快被用起来。而不是费劲力气编写大量的维护代码来编写完美的软件。

## 反应器模式(reactor pattern)