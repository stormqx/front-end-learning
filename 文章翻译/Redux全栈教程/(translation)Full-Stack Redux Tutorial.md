## Full-Stack Redux Tuturial（译）
> 原文链接： [Full-Stack Redux Tuturial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html)
>
>作者: [Tero Parviainen](http://teropa.info/) ([@teropa](https://twitter.com/teropa))

### 使用Redux, React,Immutable并且基于测试优先开发的综合指南
Redux是目前JavaScript领域中最令人兴奋的事情之一。它从众多库和框架中脱颖而出，做了很多绝对正确的事情：一个简单、可预测的状态模型。强调函
数式编程和不可便数据。一个微小但集中的API...怎能让我们不喜欢它？

Redux是一个非常小的库，学习它的所有API并不是很困难。但是对于很多人来说，它创建了一种范式转换：微量的构建块和一些自我约束的限制(包括纯函
数和不可变数据)可能让人感觉受到限制。所以到底应该如何完成工作？

本教程将指导您从头开始构建一个全栈的Redux和ImmutableJs应用。我们将使用测试优先开发真实应用程序，该程序后端基于Node+Redux构建，前端基于
React+Redux构建。在我们的工具箱里还包括ES6,Babel,Socket.io,Webpack以及Mocha.它非常有趣，你可以在任何时候跟上它的节奏。

<h3 id="content"> 目录</h3>
* [目录](#content)
* [你所需要的](#What_You_Will_Need)
* [App](#App)
* [体系结构](#The_Architecture)
* [服务端应用程序](#The_Server_Application)
  * [设计应用程序State Tree](#Designing_The_Application_State_Tree)
  * [项目安装](#Project_Setup)
  * [熟悉不可变数据](#Getting_Comfortable_With_Immutable)
  * [使用纯函数编写逻辑层](#Writing_The_Application_Logic_With_Pure_Functions)
    * [加载条目](#Loading_Entries)
    * [开始投票](#Starting_The_Vote)
    * [投票中](#Voting)
    * [开始下一对](#Moving_to_The_Next_Pair)
    * [结束投票](#Ending_The_Vote)
  * [介绍 Actions 和 Reducers](#Introducing_Actions_and_Reducers)
  * [组合 Reducers 的味道](#A_Taste_of_Reducer_Composition)
  * [介绍Redux Store](#Introducing_The_Redux_Store)
  * [建立Socket.io服务器](#Setting_Up_a_Socket.io_Server)
  * [广播来自Redux监听器的state](#Broadcasting_State_from_A_Redux_Listener)
  * [接收远程Redux Actions](#Receiving_Remote_Redux_Actions)
* [客户端应用程序](#The_Client_Application)
  * [客户端项目安装](#Client_Project_Setup)
    * [支持单元测试](#Unit_Testing_support)
  * [React 以及 React热加载](#React_and_react-hot-loader)
  * [编写投票界面UI](#Writing_The_UI_for_The_Voting_Screen)
  * [编写投票结果界面UI以及处理路由](#Writing_The_UI_for_The_Results_Screen_And_Handling_Routing)
  * [客户端Redux store介绍](#Introducing_A_Client-Side_Redux_Store)
  * [react从Redux获得数据](#Getting_Data_In_from_Redux_to_React)
  * [安装Socket.io客户端](#Setting_Up_The_Socket.io_Client)
  * [从服务端接收Actions](#Receiving_Actions_From_The_Server)
  * [从react组件分发Actions](#Dispatching_Actions_From_React_Component)
  * [使用Redux中间件向服务端发送Actions](#Sending_Actions_To_The_Server_Using_Redux_Middleware)
* [练习](#exercises)
  * [预防无效投票](#Invilid_Vote_Prevention)
  * [改进投票state重置](#Improved_Vote_State_Reset)
  * [预防重复投票](#Duplicate_Vote_Prevention)
  * [重新开始投票](#Restarting_The_Vote)
  * [指示套接字连接state](#Indicating_Socket_Connection_State)
  * [加分挑战：Going Peer To Peer](#Bouns_Challenge_Going_Peer_To_Peer)

<h3 id="What_You_Will_Need"> 你所需要的</h3>

本教程对知道如何编写JavaScript应用程序的工程师是最有用的。我们将使用Node,ES6, React, Webpack和Babel,因此如果你已经熟悉了这些工具,
你学习接下来的内容应该不会遇到麻烦。否则，你应该先去学习一些相关基础知识。

谈及工具,你只要有带有NPM的Node和一款喜欢的文本编辑器即可，事实就是这样。

<h3 id="App"> App</h3>

我们将开发一款投票APP，它可以为党派、会议和聚会提供现场投票。

这个想法是，我们将有一系列要投票的东西： 电影、歌曲、编程语言、Horse JS quotes等任何东西。APP将它们成对放在一起PK，所以在每一轮人们都
可以在二者中投票给喜欢的。当只剩下一个时，它便是胜者。

例如，下面是关于Danny Boyle的最佳电影的投票流程图：
![投票流程图](image/vote_logic.png)

本APP将有两个独立的用户界面：投票UI可以适用于移动设备，或者其他可以使用浏览器的东西。投票结果UI设计为投影在投影仪或者其他大屏幕上。它将
实时显示正在投票的结果。

![vote_system1](image/vote_system1.png)

<h3 id="The_Architecture"> 体系结构</h3>

本系统在技术上由两部分组成：基于React的浏览器APP提供用户界面和一个服务器应用程序，我们使用Node处理投票逻辑。两者之间使用WebSockets进行
通信。

我们将使用Redux来组织客户端和服务端的代码。为了保持状态，我们将使用不可变的数据结构。

---
尽管客户端和服务端的代码会有许多相似的地方——例如，都将使用Redux——但它并不是真的同构应用(universal/isomorphic application)，它们实际
上并不能共享任何代码。

它更像是一个通过传递消息进行通信的应用程序组成的分布式系统。

---

<h3 id="The_Server_Application"> 服务端应用程序</h3>

我们打算先编写Node程序，之后再编写React程序。这可以使我们在开始思考UI界面前专注于核心逻辑。

随着我们创建服务端程序，我们将熟悉Redux和Immutable，并将看到如何使用它们构建应用程序。Redux大多数情况下与React应用程序相关，但是它实际
上并不局限于这一种用例。我们将要学习的一部分是Redux在其他上下文中是多么有用。

我推荐跟着教程从头开始写APP，但是如果你也可以选择直接从[github](https://github.com/teropa/redux-voting-server)上clone代码。

<h3 id="Designing_The_Application_State_Tree"> 设计应用程序State Tree</h3>

设计一个Redux应用程序经常从考虑应用程序的state开始。它描述了在任何给定的时间，您的应用程序将要发生什么。

所有的框架和体系结构都有state。在Ember应用程序和Backbone应用程序中,state在Model里面。在Augular应用程序中，state经常存放在
Factories和Services里面。在大部分的Flux实现中，state存放在Stores里面。Redux和上面提到的有何不同呢？

主要的不同是在Redux中，应用程序的state被存放在单一的树结构中。换句话说，一切你所知道的关于你的应用程序的state全部存放在一个由maps和
arrays组成的数据结构中。

这产生了很多后果，马上我们就会看到。最重要的后果之一是这如何让你从应用程序的行为中独立出来思考应用程序的state(how this lets you think
about the application state in isolation from the application's behavior).State是纯数据。它没有方法或者函数。它并没有卷在对象
当中。所有的都存放在同一个地方。

这可能听起来像是一种局限，尤其是你有OO的经历来学习Redux。但实际上它更像是一种解放，因为这种方式可以让你专注于数据并且只是数据。如果你花
一点时间来设计应用程序state, 几乎一切都会遵循。

这并不是说你总是先设计整个state树，然后才是APP剩下的部分。通常你最终以并行方式演进。但是，我发现在开始写代码之前，对state树应该如何设计
有一个初步的认识是非常有用的。

所以，让我们看下我们的投票系统的state树应该是什么样的。该系统的目的是在一些东西(电影、乐队等等)上投票。一种合理的初始state可能是将要被
投票的东西的集合。我们可以称这个集合为entries:
![vote_server_tree_entries](image/vote_server_tree_entries.png)

当第一次投票开始，此时应该有一些方式来区分哪个是当前被投票的。在这种情况下，应该有一个vote entry在state中，它保留着目前处于投票状态的
物品对。物品对或许应该从entries集合中拿出来。
![vote_server_tree_pair](image/vote_server_tree_pair.png)

在投票开始之后，票数也应该被存储起来。我们可以用vote中另外的数据结构来做这件事。
![vote_server_tree_tally](image/vote_server_tree_tally.png)

当一次投票结束，失败的entry将会被舍弃，胜利的entry将会被放回entries，作为最后一个物品(item).它之后将会与其他物品进行PK。接下来的两个
entry同样会被放在vote中。
![vote_server_tree_next](image/vote_server_tree_next.png)

只要还有待投票的entries，我们可以想象出这种state循环。在某些时候，将只剩下一个entry。这时，我们就可以称它为胜者并结束投票:
![vote_server_tree_winner](image/vote_server_tree_winner.png)

这看起来似乎是一种可行的设计。有很多不同的方法来设计这些要求的state，这可能不是最佳的。但是这并不重要。只需要在开始的时候足够好就行，
重要的是我们已经建立了一种具体的应用程序该如何执行任务的想法。这是我们甚至没有考虑任何代码之前就完成的！

<h3 id='Project_Setup'> 项目安装</h3>

说了这么多废话，是时候开始干活了。在我们做任何事情之前，我们需要建立一个项目目录并且初始化它作为一个NPM项目：
```zsh
mkdir voting-server
cd voting-server
npm init -y
```
输入命令后的结果是在voting-server目录下有一个文件package.json.

我们打算使用ES6语法来编写程序。虽然node从4.0.0版本支持很多ES6特性，但是它仍然不支持模块化(modules),而模块化正是我们想用的。我们需要向
项目中添加babel, 这样我们能够随心所欲的使用ES6特性，babel会将代码转换成ES5:
```zsh
npm install --save-dev babel-core babel-cli babel-preset-es2015
```
因为我们将写一系列的单元测试，我们同样需要一些库来写它们：
```zsh
npm install --save-dev  mocha chai
```
[Mocha](https://mochajs.org/)是我们将要使用的测试框架，[Chai](http://chaijs.com/)是一个断言(assertion)/期望(expectation)库，我
们在测试中使用它来指定我们期望发生的事情。

我们可以使用node_modules下的mocha命令来运行测试。
```zsh
./node_modules/mocha/bin/mocha --compilers js: babel-core/register --recursive
```
这条命令告诉Mocha递归的寻找项目中的所有测试并且运行它们。在运行前它先使用babel转化ES6代码。

从长远来看，在我们的package.json中存储这条命令将会更容易：
```js
//package.json
"script": {
  "test": "Mocha --compilers js: babel-core/register --recursive"
},
```
我们需要做的另外一件事是使babel的ES6/ES2015语法支持功能生效。这可以通过激活我们已经安装过的**babel-preset-es2015**包来完成。我们只需
要在package.json中添加babel部分：

```js
//package.json
"babel": {
  "preset": ["es2015"]
},
```
现在我们可以使用npm命令来运行测试。

```zsh
npm run test
```
**test:watch** 命令可以用来启动一个进程监控代码中的变化并且在每次变化后运行测试:
```js
//package.json
"script": {
  "test": "mocha --compolers js:babel-core/register recursive",
  "test:watch": "npm run test -- --watch"
},
```
我们首先打算用的库是Facebook的immutable, 它可以为我们提供一些数据结构使用。我们将在下一个章节讨论immutable，现在我们仅仅将它加入到项
目中来，同时安装的有chai-immutable库，它可以扩展Chai来支持比较Immutable数据结构(comparing Immutable data structures):
```zsh
npm install --save immutable
npm install --save-dev chai-immutable
```
我们需要在任何测试运行前插入chai-immutable.我们可以在一个很小的test_heler文件中做到这一点，所以我们接下来应该创建它：
```js
// test/test_helper.js

import chai from 'chai';
import chaiImmutable from 'chai-immutable';

chai.use(charImmutable);
```
接下来我们需要在Mocha启动测试之前导入test_helper文件：
```js
//package.json

"script": {
  "test": "mocha --compilers js:babel-core/register --require ./test/test_helper.js --recursive"
},
```
这就是我们在开始阶段所有需要安装的！！！

<h3 id="Getting_Comfortable_With_Immutable"> 熟悉不可变数据</h3>

关于Redux架构的第二个重点是，state不仅仅是一颗树，实际上他是一个immutable tree.

看上一节中的树，只通过更新树中的代码来更改应用程序的状态，这似乎是一个合理的想法：在maps中执行修改操作，在arrays中执行删除操作等等。然而
这并不是Redux所做的事。

一个Redux的状态树是一个immutable data structure. 这意味着一旦你有一颗state tree, 只要它还存在它将再也不会改变。它将永远保持相同的状
态。接下来你该如何进入下一个state是通过生成另外一颗state tree来反映你想要作出的改变。

这意味着应用程序的任意两个连续状态是存储在两个分开且独立的树中(separate and independent)。从一个状态跳到下一状态是通过执行一个函数，它
会获取当前的状态并返回一个新的状态。

![vote_state_succession.png](image/vote_state_succession.png)

这为什么会是好想法呢？ 人们首先提到的是如果你拥有一棵树中所有的state,并且进行了一些非破坏性的更新，你可以不需要坐太多额外的工作来保存应用
程序的历史： 仅需要保留以前state trees的集合。然后你可以执行 undo/redo 等“免费”操作——只需要将当前应用程序状态设置为历史记录中的上一个
state tree或者下一个state tree. 你同样可以序列化历史记录并且将它发送到一些存储介质中保存，这样你可以在之后重播(replay)它,这在debugging
的时候非常有用。

然而，我想说除了这些功能之外，关于immutable data最重要的是它将如何简化你的代码。你可以使用纯函数(pure function)来编程:这些函数除了获
取数据和返回数据外，不做任何其他操作。这些是可以信赖的、行为可预测的函数。你可以随意的调用它们，并且它们的行为不会改变。给它们相同的参数，
它们就会返回相同的结果。它们不会改变世界的state(they`re not going to change the state of world. //懵逼脸，为什么突然冒出这句话)。
测试将变得很随意，因为在你调用之前，不需要设置一些stub或者其他假的操作（other fakes to "prepare the universe"）.它仅仅是输入数据，
输出数据。

Immutable data structures是我们建立应用程序state需要用的材料。所以让我们花点时间来编写一些单元测试来说明它是如何工作的。

---

如果你已经熟悉了immutable data和immutable库，可以随意的跳过下一部分。

---

为了熟悉immutability的想法，我们先讨论可能是最简单的数据结构:如果有一个“计数器”应用程序，它的state仅仅是单个数字。state将会从0到1,2,...

我们已经习惯了将数字考虑为immutable data.当“计数器”增加，我们不会变化这个数字。因为在数字上没有setter，让数字变化实际上是不可能的。你
不能说**42.setValue(43)**.

取而代之的是我们获得另外一个数字，它是将之前的数字加1后的结果。我们可以纯函数来实现。它的参数是当前的state并且它的返回值将作为下一个state
被使用。下面是这个函数以及与它相关的单元测试：

```js
// test/immutable_spec.js

import {expect} from 'chai'

describe('immutability', ()=> {

  describe('a number', ()=> {

    function increment(currentState) {
      return currentState+1;
    }

    it('is immutable', ()=> {
      let state = 42;
      let nextState = increment(state);

      expect(nextState).to.equal(43);
      expect(state).to.equal(42);
    });

  });

});
```

当调用increment时state不会改变的事实是显而易见的。怎么可能呢？数字是immutable!!!

---

你可能已经注意到这个测试和我们的应用程序完全无关——我们甚至没有任何应用程序代码！

这个测试只是一个学习工具而已。我发现如果你打算研究一个新的API或者技术时，通过编写一些单元测试来证明一些想法是有用的，这正是我们在这里所
做的。Kent Beck在它的[TDD书](https://www.amazon.com/Test-Driven-Development-By-Example/dp/0321146530)中称这种测试为“学习型测
试”.

---

我们接下来要做的是拓展这种不变量的想法到所有类型的数据结构中，而不仅仅是数字。

例如，一个应用程序的state是一系列的电影，我们可以使用Immutable的list。添加一部电影生成新的电影列表的操作是通过将旧的电影列表和新的电影
相结合来完成的。至关重要的是，旧的电影列表在操作后仍然没有改变。

```js
// test/immutable_spec1.js

/**
 * Created by qixin on 27/11/2016.
 */

import {expect} from 'chai';
import {List} from 'immutable';

describe('immutability', () => {

    //..

    describe('A list', () => {

        function addMovie(currentState, movie) {
            return currentState.push(movie);
        };

        it('is immutable', () => {
            let state = List.of('Transplotting', '28 Days Later');
            let nextState = addMovie(state, 'Sunshine');

            expect(nextState).to.equal(List.of(
                'Transplotting',
                '28 Days Later',
                'Sunshine'
            ));
            expect(state).to.equal(List.of(
                'Transplotting',
                '28 Days Later'
            ));
        });

    });

});

```
如果我们向普通的数组中push一项之后，旧的state是不会保持不变的！因为我们使用了Immutable List来替代，我们就有了与number示例一样的语义。

这个想法扩展到整个state tree也是如此。一个state tree只是由Lists, Maps或者一些其他类型的集合嵌套形成的。在它上面进行操作相当于生成一颗
新的state tree,并保留下来旧的state tree. 如果state tree是一个Map,里面有一个键'Movie'指向了一个电影列表，添加一部电影意味着我们需要
新创建一个map,键'Movie'指向一个新的lis：
```js
// test/immutable_spec2.js

/**
 * Created by qixin on 27/11/2016.
 */
import {expect} from 'chai';
import {List, Map} from 'immutable';

describe('immutability', () => {

    //..

    describe('a tree', () => {

        function addMovie(currentState, movie) {
            return currentState.set(
                'movies',
                currentState.get('movies').push(movie)
            );
        };

        it('is immutable', ()=> {
           let state = Map({
              movies: List.of(
                  'Transplotting',
                  '28 Days Later'
              )
           });
           let nextState = addMovie(state, 'Sunshine');

           expect(nextState).to.equal(Map({
               movies: List.of(
                   'Transplotting',
                   '28 Days Later',
                   'Sunshine'
               )
           }));
           expect(state).to.equal(Map({
               movies: List.of(
                   'Transplotting',
                   '28 Days Later'
               )
           }));
        });

    });

})
```
这和之前的操作是同样的方法，仅仅是为了拓展展示在嵌套的数据结构中同样有效。同样的想法适用于所有类型和大小的数据。

对于如此类的嵌套数据结构的操作，immutable提供了几个帮助函数，可以更容易的"到达"嵌套数据结构来产生新的值。在
这种情况下，我们可以使用update函数来使代码更加简洁：
```js
// test/immutable_spec3.js

fuction addMovie(currentState, movie) {
  return currentState.update('movies', movies => movies.push(movie));
};
```
上述例子可以让我们了解immutable数据。它将被用作我们应用程序的state. 还有很多功能包含在immutable API中，我们
仅仅简单的介绍一些"皮毛"。

---

虽然immutable data是Redux体系架构中的关键点，但是使用Immutable库并不是必须的。事实上，在Redux官方文档中大部
分使用的还是plain old JavaScript objects和数组，简单的避免按照惯例改变它们的值。

在这篇教程中，我们使用Immutable库来代替它，主要有以下几个原因：
* Immutable`s data structures是从头开始设计被用来不可变使用，因此提供了一些使immutable操作更方便的API。
* 我赞同Rich Hickey的观点[there is no such as things as immutability by convention](http://codequarterly.com/2011/rich-hickey/)
。如果你使用可变的数据结构，你或者其他人迟早会错误地改变它们。当你刚刚开始的时候尤其如此，像object.freeze()这类
东西可能会有帮助。
* Immutable·s data structure是持久的([persistent](https://en.wikipedia.org/wiki/Persistent_data_structure))
，这意味着它们是内部结构化的，使得新的版本在时间和存储上都是高效的，即使对于大型的state tree也是如此。使用plain
objects和数组可能会造成过量的复制，这会降低性能。

---

<h3 id="Writing_The_Application_Logic_With_Pure_Functions"> 使用纯函数编写逻辑层</h3>

在了解了immutable state trees和在树上进行操作的纯函数。我们可以将我们的注意力转移到投票系统的逻辑层上。应用程序
的核心将由我们一直在讨论的部分组成：一个tree structure以及一些产生新版tree structure的函数。

<h3 id="Loading_Entries"> 加载条目</h3>

首先，正如我们前面所讨论的，应用程序允许"加载"一系列想要被投票的条目。我们应该有一个**setEntries**函数，它可以获取之
前的state和一系列条目，生成一个包括所有条目的state,下面是相关的测试代码：
```js
/**
 * Created by qixin on 27/11/2016.
 */

import {List, Map} from 'immutable';
import {expect} from 'chai';

import {setEntries} from '../src/core';

describe('application logic', () => {

    describe('setEntries', () =>{

        it('add the entries to the state', () => {
           const state = Map();
           const entries = List.of('Transplotting', '28 Days Later');
           const nextState = setEntries(state, entries);
           expect(nextState).to.equal(Map({
               entries: List.of('Transplotting', '28 Days Later')
           }));
        });
    });
})
```

**setEntries**的最初实现尽可能做最简单的事情：它可以在Map中设置一项键为'entries'，值为给定的一系列entries.这
生成了我们之前设计的第一个state tree.

```js
/**
 * Created by qixin on 27/11/2016.
 */
export function setEntries(state, entries) {
    return state.set('entries', entries);
}

```

为了方便，我们允许输入的条目是一个普通的js数组(或者是其他可迭代的集合)。当在state tree中，它仍然是一个immutable List。

```js
// test/core.js

        it('converts to immutable', () =>{
            const state = Map();
            const entries = ['Transplotting', '28 Days Later'];
            const nextState = setEntries(state, entries);
            expect(nextState).to.equal(Map({
                entries: List.of('Transplotting', '28 Days Later')
            }));
        });
```
在实现中，我们应该传递给定的entries给List构造器来满足这个需求：
```js
/**
 * Created by qixin on 27/11/2016.
 */
import {List} from 'immutable';


export function setEntries(state, entries) {
    return state.set('entries', List(entries));
}


```

<h3 id="Starting_The_Vote"> 开始投票</h3>

在已经拥有entries set的state上，调用next函数后我们开始投票。这意味着，从我们设计的状态树的第一个到第二个(图1 --- 图2)。

函数不需要额外的参数。在state中应该建立一个**vote** Map, 并且两个条目包含在键为pair的键值对中。处于投票阶段的条目不应
该再出现在entries List中。

```js
// test/core_spec1.js

/**
 * Created by qixin on 30/11/2016.
 */

import {List, Map} from 'immutable';
import {expect} from 'chai';
import {setEntries, next, mapTest1} from '../src/core';


describe('application logic', () => {

    //..

    describe('next', () => {

        it('take the next two entries under vote', () => {
            const state = Map({
                entries: List.of('Transpotting', '28 Days Later', 'Sunshine')
            });
            const nextState = next(state);
            expect(nextState).to.equal(Map({
                vote: Map({
                    pair: List.of('Transpotting', '28 Days Later')
                }),
                entries: List.of('Sunshine')
            }));
        });

    });

});
```
实现这个操作将会[merge](https://facebook.github.io/immutable-js/docs/#/Map/merge)一个更新进old state,更新包括
将头两个条目放到一个List中，其他在仍存放在新版的**entries**中：
```js
// test/core.js

import {List, Map} from 'immutable';

//...

export function next(state) {
    const entries = state.get('entries');
    return state.merge({
        vote: Map({pair: entries.take(2)}),
        entries: entries.skip(2)
    });
}
```

<h3 id="Voting"> 投票中</h3>

当一个投票进行时，应该可以让人们对条目进行投票。当对一个条目进行新的投票时，它的"计数"（tally)也应该出现在投票中。如果一个
条目已经有了计数，它应该被增加：
```js
// test/core_spec3.js

/**
 * Created by qixin on 30/11/2016.
 */

import {List, Map} from 'immutable';
import {expect} from 'chai';
import {setEntries, next, vote} from '../src/core';

describe('application logic', () => {

    //..

    describe('vote', () => {

        it('creates a tally for the voted entry', () => {
            const state = Map({
                vote: Map({
                    pair: List.of('Transplotting', '28 Days Later')
                }),
                entries: List()
            });

            const nextState = vote(state, 'Transplotting');
            expect(nextState).to.equal(Map({
                vote: Map({
                    pair: List.of('Transplotting', '28 Days Later'),
                    tally: Map({
                        'Transplotting': 1
                    })
                }),
                entries: List()
            }));
        });

        it('adds to existing tally for the voted entry', () => {
            const state = Map({
                vote: Map({
                    pair: List.of('Transplotting', '28 Days Later'),
                    tally: Map({
                        'Transplotting': 3,
                        '28 Days Later': 2
                    })
                }),
                entries: List()
            })

            const nextState = vote(state, 'Transplotting');
            expect(nextState).to.equal(Map({
                vote: Map({
                    pair: List.of('Transplotting', '28 Days Later'),
                    tally: Map({
                        'Transplotting': 4,
                        '28 Days Later': 2
                    })
                }),
                entries: List()
            }));

        });
    });
});
```

---

 你可以使用Immutable中的[fromJS](https://facebook.github.io/immutable-js/docs/#/fromJS)函数更简洁的构建这些嵌
 套的Maps和Lists。

---

我们可以下面的代码来通过这些测试：
```js
// test/core.js

export function vote(state, entry) {
    return state.updateIn(
        ['vote', 'tally', entry],
        0,
        tally => tally+1
    );
}
```
使用[updateIn](https://facebook.github.io/immutable-js/docs/#/Map/updateIn)是多么的优雅！这段代码的意思是"进入
嵌套路由结构路径['vote', 'tally', 'Transplotting'], 并且在这里应用该函数。如果在路径中有键不存在，将会在该位置创建
新的Maps。如果最后的值缺失，用"0"来进行初始化。

它包装了很多层(It packs a lot of punch)，但这正是让我们可以愉快得使用Immutable data structures的那类代码，因此花点
时间来熟悉它是值得的。
```js
updateIn()

updateIn(keyPath: Array<any>, updater: (value: any) => any): Map<K, V>
updateIn(
    keyPath: Array<any>,
    notSetValue: any,
    updater: (value: any) => any
): Map<K, V>

updateIn(keyPath: Iterable<any, any>, updater: (value: any) => any): Map<K, V>

updateIn(
    keyPath: Iterable<any, any>,
    notSetValue: any,
    updater: (value: any) => any
): Map<K, V>
```

<h3 id="Moving_to_The_Next_Pair"> 开始下一对</h3>

一旦关于一对条目的投票结束，我们应该开展下一对条目的投票。当前投票结果获胜的条目应该被保存，并且添加在entries的最后，以便
后来仍然可以被用来与其他条目配对pk。如果票数相同，两个条目都应该保存。

我们在已经实现的**next**函数中添加这个逻辑：
```js
/**
 * Created by qixin on 30/11/2016.
 */

import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';
import {next} from '../src/core';

describe("application logic", () => {

    //..

   describe('winnerAndNext', () => {

       it('put winner of current vote back to entries', () => {
           const state = fromJS({
               vote: {
                   pair: ['Transplotting', '28 Days Later'],
                   tally: {
                       'Transplotting': 4,
                       '28 Days Later': 2
                   }
               },
               entries: ['Sunshine', 'Millions', '127 Hours']
           });

           const nextState = next(state);
           expect(nextState).to.equal(fromJS({
               vote: {
                   pair: ['Sunshine', 'Millions']
               },
               entries: ['127 Hours', 'Transplotting']
           }));
       });

       it('puts both from tied vote back to entries', () => {
           const state = Map({
               vote: Map({
                   pair: List.of('Trainspotting', '28 Days Later'),
                   tally: Map({
                       'Trainspotting': 3,
                       '28 Days Later': 3
                   })
               }),
               entries: List.of('Sunshine', 'Millions', '127 Hours')
           });
           const nextState = next(state);
           expect(nextState).to.equal(Map({
               vote: Map({
                   pair: List.of('Sunshine', 'Millions')
               }),
               entries: List.of('127 Hours', 'Trainspotting', '28 Days Later')
           }));
       });
   });
});

```
在实现中，我们只是将当前投票的“获胜者”连接到entries后面.我们可以使用getWinners新功能找到这些赢家：
```js
// src/core.js

function getWinners(vote) {
  if (!vote) return [];
  const [a, b] = vote.get('pair');
  const aVotes = vote.getIn(['tally', a], 0);
  const bVotes = vote.getIn(['tally', b], 0);
  if      (aVotes > bVotes)  return [a];
  else if (aVotes < bVotes)  return [b];
  else                       return [a, b];
}

export function next(state) {
  const entries = state.get('entries')
                       .concat(getWinners(state.get('vote')));
  return state.merge({
    vote: Map({pair: entries.take(2)}),
    entries: entries.skip(2)
  });
}
```

<h3 id="Ending_The_Vote"> 结束投票</h3>

在某一时刻，当投票结束时将只剩下一个条目。这时我们将有一个获胜的entry.我们应该做的不是试图形成下一个
投票，而是明确的在state中设置赢者。与此同时，投票结束了。
```js
// test/core_spec5.js

describe('next', () => {

  // ...

  it('marks winner when just one entry left', () => {
    const state = Map({
      vote: Map({
        pair: List.of('Trainspotting', '28 Days Later'),
        tally: Map({
          'Trainspotting': 4,
          '28 Days Later': 2
        })
      }),
      entries: List()
    });
    const nextState = next(state);
    expect(nextState).to.equal(Map({
      winner: 'Trainspotting'
    }));
  });

});
```
在**next**的实现中，我们应该有一个特殊条件来处理当entries的大小变为1的情况：
```js
// src/core.js

export function next(state) {
  const entries = state.get('entries')
                       .concat(getWinners(state.get('vote')));
  if (entries.size === 1) {
    return state.remove('vote')
                .remove('entries')
                .set('winner', entries.first());
  } else {
    return state.merge({
      vote: Map({pair: entries.take(2)}),
      entries: entries.skip(2)
    });
  }
}
```
我们在这里可以仅仅返回**Map({winner: entries.first()})**。但是我们并没有这么做，取而代之的是我们仍然
接受old state做为起点并且明确的从中去除了键'vote'和'entries'。这么做的原因是面向未来的(future-proofing):
在某些时候，我们可能在state中有一些不相关的数据，它应该不变地通过这个函数。这些状态转换函数中总是将old state
渐变为new state而不是从头开始构建new state通常是个好主意。

关于我们应用程序的核心逻辑，这里已经有了一个由几个函数组成的可接受版本。我们同样还有关于它们的单元测试，写这些
测试是相对容易的：no setup, no mock, no stub. 这是纯函数的魅力。我们可以调用它们并检查返回值。

注意：到目前为止，我们还没有安装redux. 我们可以全身心的投入到应用程序的逻辑中，不需要将"框架"带进来。这是一件
非常令人愉快的事情。

<h3 id='Introducing_Actions_and_Reducers'> 介绍 Actions 和 Reducers</h3>

我们已经有了应用程序的核心函数，但是在Redux中，你实际上不需要直接调用这些函数。在函数和外部世界之间还有一个中间
层： Actions。

Action是一种简单的数据结构，描述了应用程序中应该发生的变化。它基本上描述了一个包装成小对象的函数调用。按照惯例，
每一个action都有type属性，它描述了动作的操作。Action也可能携带其他属性。下面是几个与我们的核心函数相匹配的样例
Action。
```js
{type: 'SET_ENTRIES', entries: ['Transplotting', '28 Days Later']}

{type: 'NEXT' }

{type: 'VOTE', entry: 'Transplotting'}
```
如果actions使用这种写法，我们同样需要一种方式将它们转换成实际的核心函数调用。例如，对于**VOTE** action,应进行
以下调用：
```js
// this action
let voteAction = {type: 'VOTE', entry: 'Transplotting'};
// should cause this to happen
return vote(state, voteAction.entry);
```
我们将要写的是能够根据当前state进行任何action的通用函数，并且能够调用与action相匹配的核心函数。这个函数被称为：
reducer:
```js
// src/reducer.js

/**
 * Created by qixin on 01/12/2016.
 */
export default function reducer(state, action) {
    //figure out which function to call and call it
}
```

我们应该测试reducer确实能够处理我们的三个action:
```js
// test/reducer_spec.js

/**
 * Created by qixin on 01/12/2016.
 */

import {Map, fromJS} from 'immutable';
import {expect} from 'chai';

import reducer from '../src/reducer';

describe('reducer', () => {

    it('handle SET_ENTRIES', () => {
       const initialState = Map();
       const action = {type: 'SET_ENTRIES', entries: ['Transplotting', '28 Days Later']};
       const nextState = reducer(initialState, action);

       expect(nextState).to.equal(fromJS({
           entries: ['Transplotting', '28 Days Later']
       }));
    });

    it('handle NEXT', () => {
        const initialState = fromJS({
            entries: ['Transplotting', '28 Days Later']
        });
        const action = {type: 'NEXT'};
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            vote:{
                pair: ['Transplotting', '28 Days Later']
            },
            entries: []
        }));
    });

    it('handle VOTE', () => {
        const initialState = fromJS({
            vote: {
                pair: ['Transplotting', '28 Days Later']
            },
            entries: []
        });
        const action = {type: 'VOTE', entry: 'Transplotting'};
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Transplotting', '28 Days Later'],
                tally: {
                    'Transplotting' : 1
                }
            },
            entries: []
        }));
    });

});
```


一个reducer应该根据action的类型委托相应的核心函数。它还知道如何从每个action对象中解压出每个函数的附加参数:
```js
// src/reducer.js

/**
 * Created by qixin on 01/12/2016.
 */
import {setEntries, next, vote} from './core'

export default function reducer(state, action) {
    //figure out which function to call and call it
    switch (action.type) {
        case 'SET_ENTRIES':
            return setEntries(state, action.entries);
        case 'NEXT':
            return next(state);
        case 'VOTE':
            return vote(state, action.entry);
    }
    return state;
}
```
注意：如果reducer不能识别the action, 它将会返回当前state.

Reducer另外一个重要的要求是如果它们以未定义的状态被调用时，它们知道如何将其初始化为有意义的值。在我们这种条件
下，初始值是Map。因此，给定一个未定义状态就等于给定一个空的Map,同样是有效的。
```js
// test/reducer_spec1.js

/**
 * Created by qixin on 01/12/2016.
 */
import {Map, fromJS} from 'immutable';
import {expect} from 'chai';

import reducer from '../src/reducer';

describe('reducer', () => {

    //..

    it('initial a undefined state', () => {
        const action = {type: 'SET_ENTRIE', entries: ['Transplotting']};
        const nextState = reducer(undefined, action);

        expect(nextState).to.equal(fromJS({
            entries: ['Transplotting']
        }));
    });
});
```
因为我们应用程序的逻辑存放在**core.js**中，在这里引入初始state是有道理的：
```js
// src/core.js

export const INITIAL_STATE = Map();
```

在reducer中，我们导入它，并且将它做为state参数的默认值：

```js
/**
 * Created by qixin on 01/12/2016.
 */
import {setEntries, next, vote, INITIAL_STATE} from './core'

export default function reducer(state = INITIAL_STATE, action) {
    //figure out which function to call and call it
    switch (action.type) {
        case 'SET_ENTRIES':
            return setEntries(state, action.entries);
        case 'NEXT':
            return next(state);
        case 'VOTE':
            return vote(state, action.entry);
    }
    return state;
}
```
关于这个reducer的工作方式有趣的是给定任何类型的action,它如何能够普遍的用于将应用程序的一个状态切换到
下一个。给定一个历史state的集合，你实际上可以通过[reduce](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
集合到当前state.这也是为什么函数被称为reducer: 它满足了reduce回调函数的约定。
```js
// test/reducer_spec2.js

/**
 * Created by qixin on 01/12/2016.
 */

import {Map, fromJS} from 'immutable';
import {expect} from 'chai';

import reducer from '../src/reducer';

describe('reducer', () => {

    it('can be used with reduce', () => {
        const actions = [
            {type: 'SET_ENTRIES', entries: ['Trainspotting', '28 Days Later']},
            {type: 'NEXT'},
            {type: 'VOTE', entry: 'Trainspotting'},
            {type: 'VOTE', entry: '28 Days Later'},
            {type: 'VOTE', entry: 'Trainspotting'},
            {type: 'NEXT'}
        ];

        const finalState = actions.reduce(reducer, Map());
        expect(finalState).to.equal(fromJS({
            winner: 'Trainspotting'
        }));
    });
});
```
与直接调用核心函数相比，批量(batch) 和／或 重放(replay) action集合的能力是action/reducer状态转换模型
的主要优点。例如，给定actions是可以序列化成JSON的对象，你可以轻易的将它们发送到Web Worker,并在那里运行
你的reducer逻辑。或者你甚至可以通过网络来发送它们，这也是我们后面会做的！

---

注意：我们使用普通对象而不是immutable data来作为action, 实际上这是Rudex需要我们做的。

---

<h3 id='A_Taste_of_Reducer_Composition'> 组合 Reducers 的味道</h3>

我们目前定义的核心函数是每个函数都获取应用程序的整个state,然后返回应用程序下一个完整的state.

我们可以很容易理解为什么在大型程序中保持这种模式不是一个好的想法。如果应用程序中的每个操作都需要知道整个
state的结构，它会变得很脆弱。如果你想改变state的形状，需要修改大量的地方。

更好的想法是，每当可以操作的时候，尽量是操作进行在最小的一块state(或者子树)。 我们讨论的是模块化：让处理
一小部分state的函数只对那一小部分state进行操作，仿佛剩下的state不存在一样。

我们的应用程序太小了，所以没有这类问题，但是我们已经有了改进它的机会：**vote**函数是没有理由来接收应用程序
整个state的，因为它仅仅对'vote'部分进行操作。它只需要知道这些东西就够了。我们可以修改已经写好的与**vote**
相关的单元测试来实现这个想法：
```js
// test/core_spec3.js

/**
 * Created by qixin on 30/11/2016.
 */

import {List, Map} from 'immutable';
import {expect} from 'chai';
import {vote} from '../src/core';

describe('application logic', () => {

    //..

    describe('vote', () => {

        it('creates a tally for the voted entry', () => {
            const state = Map({
                pair: List.of('Transplotting', '28 Days Later')
            });

            const nextState = vote(state, 'Transplotting');
            expect(nextState).to.equal(Map({
                pair: List.of('Transplotting', '28 Days Later'),
                tally: Map({
                    'Transplotting': 1
                })
            }));
        });

        it('adds to existing tally for the voted entry', () => {
            const state = Map({
                pair: List.of('Transplotting', '28 Days Later'),
                tally: Map({
                    'Transplotting': 3,
                    '28 Days Later': 2
                })
            });

            const nextState = vote(state, 'Transplotting');
            expect(nextState).to.equal(Map({
                pair: List.of('Transplotting', '28 Days Later'),
                tally: Map({
                    'Transplotting': 4,
                    '28 Days Later': 2
                })
            }));

        });
    });
});
```

正如我们所看到这，这么做同时简化了测试代码，这通常是个好预兆！

**vote**函数实现部分现在只需要接收state中的vote部分，然后更新它的票数：
```js
export function vote(voteState, entry) {
    return voteState.updateIn(
        ['tally', entry],
        0,
        tally => tally+1
    );
}
```
现在，选取与**vote**函数相关的一部分state变成了reducer的部分工作：
```js
// src/reducer.js

export default function reducer(state = INITIAL_STATE, action) {
    //figure out which function to call and call it
    switch (action.type) {
        case 'SET_ENTRIES':
            return setEntries(state, action.entries);
        case 'NEXT':
            return next(state);
        case 'VOTE':
            return state.update('vote',
                                 voteState => vote(voteState, action.entry));
    }
    return state;
}
```

这是这种模式的一个小例子，它在大型应用程序中变得越来越重要：main reducer函数只是传送lower-level reducer
所需要的state。我们把 在state tree上找到正确位置的任务 和 将更新应用于该位置 分离开。

[Redux documentation for reducers](http://redux.js.org/docs/basics/Reducers.html)对于这种reducer
组成的模式有着更详细的描述，并且还描述了一些在大多数情况下使reducer组合更容易的帮助函数。

<h3 id='Introducing_The_Redux_Store'> 介绍Redux Store</h3>

现在我们有一个reduce, 接下来我们可以看看这是怎么插入Redux中的。

正如我们所看到的，如果你拥有应用程序将要发生的所有action的集合, 你应该调用reduce。弹出应用程序的最终state。当然，
通常你不会拥有所有actions的集合。它们将随着时间的推移而传播，正像现实世界中发生的: 当用户使用app时，当从网络中接收
数据时，或者当超时触发时。

为了应对这种实际情况，我们可以使用Redux Store。正如名字所蕴含的一样，它是存储随着时间推移你的应用程序state的对象。

Redux Store用一个reducer函数进行初始化，例如我们已经实现的：
```js

import {createStore} from 'redux';

const store = createStore(reducer);
```

接下来你可以做的是分发(dispatch) actions到store中。Store将在内部使用你的reducer, 并将actions作用于当前state,然后
存储并生成下一状态：
```js

store.dispatch({type: 'NEXT'});
```

在任何时间点，你都可以从store内部获得当前的state:
```js
store.getState();
```

我们将要建立并导出Redux Store到一个名为store.js的文件中。让我们首先测试它。我们可以通过它建立一个store, 读取它的初始state,
分发action，并且看到已经改变的state:
```js
/**
 * Created by qixin on 04/12/2016.
 */

import {Map, fromJS} from 'immutable';
import {expect} from 'chai';

import makeStore from '../src/store';

describe('store', () => {

    it('is a Redux store configured with the corrent reducer', () => {

        const store = makeStore();
        expect(store.getState()).to.equal(Map());

        store.dispatch({
            type: 'SET_ENTRIES',
            entries: ['Transplotting', '28 Days Later']
        });

        expect(store.getState()).to.equal(fromJS({
            entries: ['Trainspotting', '28 Days Later']
        }));

    });

});

```
在创建Store之前，我们需要将redux加入工程中:
```zsh

npm install --save redux
```
接下来我们可以创建store.js文件，它只是简单了调用了createStore函数和之前的reducer.
```js
// src/store.js


import {createStore} from 'redux';
import reducer from './reducer';

export default function makeStore() {
    return createStore(reducer);
}
```

因此，Redux store将事物都联系在一起，我们可以使用它作为应用程序的中心点：它持有当前state,并且随着时间的推移,
可以接收从一个版本到下一个版本演化的动作，使用我们编写的应用程序核心逻辑。

---

问：在Redux应用中，你需要多少变量？

答：一个. store中的那一个。

这种理念开始时听起来很可笑——如果你不太熟悉函数式编程。如何才能只使用一个变量来做任何有用的事情？

但是实际上，我们并不需要任何其他的变量。在我们的应用程序中，current state tree是唯一随着时间变化的东西。其他
的都是常量或者不可变数据。

---

我们的应用程序代码和Redux是如此的小，这是非常显著的。因为我们有一个通用的reducer方法，所以我们仅仅需要让Redux
知道reducer。其他都是与我们自身相关的，与框架无关的，高度可移植和纯函数代码！

如果我们现在为应用程序创建入口index.js, 我们可以让它创建和导出store:
```js
// index.js

import makeStore from './src/store';

export const store = makeStore();

```
因为我们导出了store, 你现在可以启动一个node REPL(例如使用babel-node),require index.js文件，使用store与应用程序
进行交互。

<h3 id='Setting_Up_a_Socket.io_Server'> 建立Socket.io服务器</h3>

我们的应用程序将作为一个单独的浏览器应用程序的服务器，提供用于投票和查看结果的UI.为了到达这个目的，我们需要一种客户端
和服务器交流的方式。

这应该是一个实时通讯app，因为投票者如果看到自己投票后立即产生了效果，会感觉非常有趣。出于这个因素，我们使用WebSocket
进行通讯。更具体的，我们使用Socket.io库，为WebSocket提供了不错的抽象，它可以跨浏览器工作。它还为不支持WebSocket的
客户端提供了多种回退机制。

让我们在项目中添加Socket.io：
```zsh

npm install --save socket.io
```

接下来，我们新建一个server.js文件，它导出一个创建socket.io服务器的函数。
```js
import Server from 'socket.io';

export default function startServer() {
    const io = new Server().attach(8090);
}
```
这里创建了一个socket.io服务器，是一个绑定了8090端口的正常http服务器。端口的选择是任意的，但是我们后面从客户端链接时
需要匹配端口号。

我们可以让index.js调用这个函数，因此当app启动时服务器同时被启动：
```js
// index.js

import creatStore from './src/store';
import startServer from './src/server';

export const store = makeStore();
startServer();
```
如果我们在package.json文件中添加了start命令，我们让启动环节变得更简单一些：
```js

"script": {
    "start": "babel-node index.js",
    "test": "mocha: --compilers js:babel-core/register --require ./test/test_helper.js --recursive",
}   "test:watch": "npm run test -- --watch"

```

现在我们可以通过敲入下列命令简单的开启服务器(并创建Redux store：
```zsh
npm run start
```

---

**babel-node** 命令来自于之前安装的**babel-cli**包。它可以支持babel transpilling来运行node代码。它增加一些
性能开销，因此一般在生产环境中不推荐使用，但它适用于我们教程的目的。

---

<h3 id='Broadcasting_State_from_A_Redux_Listener'> 广播来自Redux监听器的state</h3>

我们有一个socket.io服务器和一个Redux state容器，但是我们还没有以任何方式整合它们。接下来我们要做的就是改变这种情况。

我们的服务器应该能够让客户端知道应用程序的current state。(例如："哪个条目正在被投票"，"当前投票票数是多少"，"有胜利
者吗?")。当发生变化时，它可以通过发送一个socket.io事件到所有已连接的客户端。

我们怎么能知道发生改变了呢？好吧，Redux为了达到这个目的提供了一些东西：你可以 **subsrcibe** 一个Redux store。你可以
提供一个函数来实现它，当state有可能改变时，这个函数在每次 **action** 应用后都会调用store。它本质上是store中state改
变的回调(callback).

我们将在startServer中实现这个，因此让我们首先给它Redux store:
```js
// index.js

import makeStore from './src/store';
import {startServer} from './src/server';

export const store = makeStore();
startServer(store);

```

我们接下来要做的是向store subscribe一个监听器,这个store可以读取current state, 将其转化为普通javascript对象，将其
作为socket.io服务器上的state action。结果是一个json序列化的状态快照通过所有活动的socket.io连接发送。
```js
import Server from 'socket.io';


export default function startServer() {
    const io = new Server().attach(8090);

    store.subscribe(
        () => io.emit('state', store.getState.toJS())
    );
}

```

---

当发生任何改变时，我们现在向所有人发布整个state。这可能导致大量的数据传输。可以想到很多优化方法(例如，只发送相关子集，
发送diffs而不是状态快照snapshots...),但是现在这种实现的好处是容易编写，所以我们只是将它用于我们的示例程序。

---

为了当状态改变时发送状态快照(state snapshot)，对于客户端来说，当它们连接上应用程序立即接收到current state是有用的。
这样可以立即同步客户端的state到最新的服务器state。

我们可以在socket.io服务器上监听'connection'事件。每次客户端连接时都会获得一个。在事件监听器中，我们可以立即发送current
state:
```js
import Server from 'socket.io';


export default function startServer() {
    const io = new Server().attach(8090);
    
    store.subscribe(
        () => io.emit('state', store.getState.toJS())
    );
    
    io.on('connection', (socket) => {
        socket.emit('state', store.getState().toJS());
    });
}


```
<h3 id='Receiving_Remote_Redux_Actions'> 接收远程Redux Actions</h3>

除了向客户端发出应用程序的state,我们还能够接收来自客户端的更新：投票人将要投出选票，投票组织者将使用NEXT action向前推进
比赛。

我们使用的解决方法其实非常简单。我们做的只是让客户端发出 'action' event直接进入到Redux Store中：
```js
// src/server.js

import Server from 'socket.io';


export default function startServer() {
    const io = new Server().attach(8090);
    
    store.subscribe(
        () => io.emit('state', store.getState.toJS())
    );
    
    io.on('connection', (socket) => {
        socket.emit('state', store.getState().toJS());
        socket.on('action', store.dispatch.bind(store));
    });
}


```

这是我们开始超越"常规Redux"的地方，因为现在我们实际上接收remote actions进入store。然而，Redux架构可以让它很容易做到：
因为actions都是简单的js对象，并且js对象很容易通过网络进行传输，我们立即得到了任何数量的用户都可以参与的投票的系统。这不是
小小的壮举！

---

这里有一些明显的安全性考虑，我们允许任何已连接的socket.io服务器将任何actions分发到Redux store中。在大多数现实情况下，这里
应该有一些防火墙。可能与[the Vert.x Event Bus Bridge](#http://vertx.io/docs/vertx-web/java/#_securing_the_bridge)
不一样。具有身份验证机制的应用程序也应该在此处插入。

---

我们的服务器现在实际操作与以下类似：

1. 一个客户端向服务器发送一个action.
2. 服务器将action发送给Redux store.
3. Store调用reducer, reducer执行与action相关的逻辑.
4. Store执行服务器subscribe的监听函数.
5. 服务器发送一个'state'事件.
6. 所有已连接的client ——包括启动原始操作的那个—— 接收到新的state.

在我们完成服务器之前，让我们为它加载一些测试条目，以便我们可以在整个系统运行时查看。我们可以添加**entries.json**文件列举出
比赛条目。例如，Danny Boyle到目前为止的电影列表，随时替换您最喜欢的主题。
```json
// entries.json

[
  "Shallow Grave",
  "Trainspotting",
  "A Life Less Ordinary",
  "The Beach",
  "28 Days Later",
  "Millions",
  "Sunshine",
  "Slumdog Millionaire",
  "127 Hours",
  "Trance",
  "Steve Jobs"
]
```

我们可以将它加载到index.js文件中，然后通过调度**NEXT** action来开启投票。
```js
// index.js

import makeStore from './src/store';
import {startServer} from './src/server';

export const store = makeStore();
startServer(store);

store.dispatch({
  type: 'SET_ENTRIES',
  entries: require('./entries.json')
});
store.dispatch({type: 'NEXT'});
```
接下来，我们准备将我们的焦点转移到客户端应用程序。

<h3 id='The_Client_Application'> 客户端应用程序</h3>

在本教程的剩余部分，我们将编写一个React应用程序，它可以连接到我们现在拥有的服务器，并使投票系统对用户开放。

我们将在客户端程序中再次使用Redu，这可能是Redux最常见的使用情况：作为React应用程序的基础引擎。我们已经看到
Redux自身是如何工作的，很快我们会详细的了解到Redux如何适应react,如果使用它影响react程序设计。

我推荐跟着下面的步骤从头开始编写app,但是如果你喜欢你也可以从[github](https://github.com/teropa/redux-voting-client)
上面获得代码。

<h3 id='Client_Project_Setup'> 客户端项目安装</h3>

---

2016-08-02 更新: 现在有一种比教程中讲的方法更简单、官方支持的方式来构建React+Webpack+Babel应用程序：
[Create React App](https://facebook.github.io/react/blog/2016/07/22/create-apps-with-no-configuration.html)工具，
我鼓励你跟着[getting started](https://github.com/facebookincubator/create-react-app#getting-started)的指导尝试一下，
来代替我们教程里面的手动安装的方法.

你需要[eject](https://github.com/facebookincubator/create-react-app#converting-to-a-custom-setup) 我们曾经用过的
热加载和单元测试，因为现在这个工具还不支持这些。

---

首先我们需要做的是新建一个npm项目，和我们对服务器的做法类似。
```zsh

mkdir voting-client
cd voting-client
npm init -y

```

我们的应用程序需要一个主页，让我们把它放在**dist/index.html**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <div id="app"></div>
    <script src="bundle.js"></script>
</body>
</html>
```

该页面包含一个id为app的<div>，我们将把应用程序放在这里。同时期望在同一目录下有一个名为bundle.js的javascript文件。

让我们为这个应用程序也创建第一个js文件.这将是应用程序的入口文件。现在我们就简单的放入一个logging statement:
```js
// src/index.js

console.log('I`m alive');
```

为了简化客户端开发工作流，我们将使用[Webpack](http://webpack.github.io/)及其开发服务器,让我们在项目中添加它们:
```zsh
npm install --save-dev webpack webpack-dev-server
```

---

如果你之前没有安装它们，也要在全局安装相同的包，这样你就可以从命令行方便的启动它们：
```zsh
npm install -g webpack webpack-dev-server
```

---

接下来，在项目的根目录下添加一个Webpack配置文件，让它与我们已经创建的文件和目录匹配起来：
```js
// webpack.config.js

module.exports ={

    entry: ['./src/index.js'],

    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'bundle.js'
    },

    devServer: {
        contentBase: './dist'
    }
};
```
这将找到我们的**index.js**入口点，并且将所有内容构建到**dist/bundle.js**中。它还将使用dist目录作为开发服务器的
基础。

现在你应该可以运行Webpack生成**bundle.js**:
```zsh
webpack
```

现在你同样可以启动开发服务，之后测试网页(包括**index.js**中的logging statement)都可以在localhost:8080访问到。
```zsh
webpack-dev-server
```

因为我们打算在客户端程序中使用ES6和React的JSX语法，我们需要一些相关工具。Babel知道如何处理它们，所以让我们添加它。
我们需要Babel和它的Webpack loader.
```zsh
npm install --save-dev babel-core babel-loader babel-preset-es2015 babel-preset-react
```

在**package.json**文件中，我们需要使Babel支持 ES6/ES2015 和 React JSX，可以通过激活我们已经安装的presets:
```json
// package.json

"babel": {
    "presets": ["es2015", "react"]
},
```

在webpack config文件中我们需要作出变化让Webpack可以沿着 **.js** 文件找到 **.jsx**文件,并且都通过Babel进行处理:
```js
//webpack.config.js

module.exports ={

    entry: ['./src/index.js'],
    module: {
        loaders:[{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel'
        }]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: './dist'
    }
};
```

---

在这篇教程中，我们不会花时间在CSS上。如果你想让app看起来更漂亮，你可以随时添加自己的风格。

或者，你可以采纳[this commit](https://github.com/teropa/redux-voting-client/commit/css)中的一些样式。除了
CSS文件，它添加了Webpack支持包括([自动初始化](https://github.com/postcss/autoprefixer))它,并且稍微改进了结果
可视化组件。

<h3 id='Unit_Testing_support'> 支持单元测试</h3>

我们同样打算对客户端程序编写一些单元测试。我们可以使用与服务器端相同的单元测试库—— Mocha和Chai ——来测试它：
```zsh
npm install --save-deve mocha chai
```

我们还打算测试React组件，这将需要一个DOM。一种可选方案是使用karma库运行在实际的浏览器上。然而，我们实际上可以不这么
做通过使用jsdom, 在node上运行的纯javascript DOM的实现。
```zsh
npm install --save-dev jsdom
```

---

最新版本的jsdom需要io.js或者node.js 4.0.0。如果你使用的是node旧版本，你需要准确的安装旧版本：
```zsh
npm install --save-dev jsdom@3
```

---

我们同样需要一些准备代码在它对react有效之前。我们其实需要建立jsdom版本的**document**和**window**对象，它们都是
浏览器普遍提供的。然后我们需要将它们放在 **global object**中，当React访问 **document** 和 **window**时可以发现
它们。我们可以为这种类型的setup code新建一个test helper文件:
```js
// test/test_helper.js


import jsdom from 'jsdom';

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

global.document = doc;
global.window = win;
```

此外，我们需要获取jsdom窗口对象包含的所有属性，例如navigator，并将它们提升到Node.js全局对象。这样做可以使窗口提供的
属性在没有**window.**前缀的情况下使用。React内部的一些代码依赖于它：
```js
// test/test_helper.js

import jsdom from 'jsdom';

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

global.document = doc;
global.window = win;

Object.keys(window).forEach((key) => {
    if(!(key in global)) {
        global[key] = window[key];
    }
});
```

我们同样打算使用Immutable集合，所以我们需要重复我们在服务器上使用的技巧来添加对它们对Chai expectation的支持。我们同时
安装immutable和chai-immutable两个包：
```zsh
npm install --save immutable
npm install --save-dev chai-immutable
```

接下来我们在test helper文件中使它生效：
```js
// test/test_helper.js

import jsdom from 'jsdom';
import chai from 'chai';
import chaiImmutable from 'chai-immutable';

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

global.document = doc;
global.window = win;

Object.keys(window).forEach((key) => {
    if(!(key in global)) {
        global[key] = window[key];
    }
});

chai.use(chaiImmutable);
```

在我们可以运行测试之前的最后一步是提出运行它们的命令，并将其放在我们的package.json中:
```json
//package.json

"script": {
    "test": "mocha --compilers js:babel-core/register --require ./test/test_helper.js \"test/**/*@(.js|.jsx)\""
}
```

这和我们服务器package.json中的命令几乎一致，它们唯一的区别在测试文件规范上：在服务器我们只使用 **--recursive**,但是该选项
不会发现 **.jsx**文件。我们需要使用 **glob**, 它会找到所有的 **.js**和 **.jsx**测试文件。

当代码变化时，连续运行测试是有用的。我们可以为此添加一个命令**test:watch**,它与服务器的命令是一样的：
```json
// package.json

"scripts": {
    "test": "mocha --compilers js:babel-core/register --require ./test/test_helper.js 'test/**/*.@(js|jsx)'",
    "test:watch": "npm run test -- --watch"
  },
```

<h3 id='React_and_react-hot-loader'> React 以及 React热加载</h3>

有了Webpack和Babel这些基础设施，我们来谈谈React!

真正cool的事情是使用Redux和Immutable构建React应用的方法是我们可以写一些"纯组件"（有时被称为Dumb component)。在概念上，它
与纯函数非常相似，它要遵守一些规则：

1. 纯组件接收所有的数据作为props, 好比函数接收所有的数据作为arguments。它应该没有副作用，包括从其他地方读取数据，启动网络请求
等等。

2. 纯组件通常没有内部state。它所渲染的内容完全取决于输入的props。使用相同的props渲染同一个纯组件应该总返回相同的结果。在组件
内部没有隐藏state会造成两次渲染的UI不同。

这与使用纯函数具有相同的[简化效果](https://www.youtube.com/watch?v=1uRC3hmKQnM&feature=youtu.be&t=13m10s): 我们可以
可以通过观察组件的输入和它所渲染的东西来确定组件的用途。我们不需要了解其他的关于该组件的知识。同时测试也会变得非常容易——几乎和
我们测试纯应用程序逻辑一样容易。

但是，首先，让我们向工程中先添加react：
```zsh
npm install --save react react-dom
```

我们也应该安装[react-hot-loader](https://github.com/gaearon/react-hot-loader)。它将为我们重新加载代码，并且不会丢失当前
state,这样可以加快我们的开发流程。
```zsh
npm install --save-dev react-hot-loader
```

我们需要修改我们的**webpack.config.js**文件来使hot-loader生效。下面使升级后的版本：
```js
// webpack.config.js

var webpack = require('webpack');

module.exports ={

    entry: [
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        './src/index.js'
    ],
    module: {
        loaders:[{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'react-hot!babel'
        }]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: './dist',
        hot: true
    },
    pludges: [
        new webpack.HotModuleReplacementPlugin()
    ]
};
```

在entry部分我们在应用程序的入口处添加了两个新东西：Webpack开发服务器的客户端库和Webpack热加载模块。这些为
[hot module replacement](https://github.com/webpack/docs/wiki/hot-module-replacement-with-webpack)提供了
webpack基础。hot module replacement不是默认加载的。因此我们还需要在**plugins**部分加载其插件，这样可以在**devServer**
部分使用它。

在**loaders**部分，我们配置react-hot和babel来支持.js和.jsx文件。

如果你现在启动或者重启开发服务器，你将会在控制台看到Hot Module Replacement成功启动。下面我们要编写第一个组件：

<h3 id='Writing_The_UI_for_The_Voting_Screen'> 编写投票界面UI</h3>

应用程序的投票界面非常简单：当投票进行时，它总是有两个按钮 —— 条目中其中一个将被投票。当投票结束时，它将显示胜者。
![voting_shots.png](image/voting_shots.png)

到目前为止，我们一直主要进行测试驱动开发，但到了react组件，我们将改变工作流程：先写组件然后再测试。这是因为Webpack和
react-hot-loader提供了一种比单元测试更严格的[feedback loop](https://blog.iterate.no/2012/10/01/know-your-feedback-loop-why-and-how-to-optimize-it/)
此外，在编写UI界面时没有一种方法比实际看到有更好的反馈。

我们假设有一个**voting**组件，并且在应用程序的入口渲染它。我们可以把它挂载到我们前面写的index.html中的#app DIV中，我们也应该
重命名index.js为index.jsx, 因为它现在包含了一些jsx语法。
```js

// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import Voting from './components/Voting';

const pair = ['Trainspotting', '28 Days Later'];

ReactDOM.render(
  <Voting pair={pair} />,
  document.getElementById('app')
);
```

Voting部件将当前正被投票的条目作为props.现在我们只需要用假数据，之后我们会用真实数据来代替它。组件本身是纯的，所以并不用担心
数据来自哪里。

同时别忘了，在webpack.config.js中的入口文件名也需要修改：
```js
// webpack.config.js

entry: [
  'webpack-dev-server/client?http://localhost:8080',
  'webpack/hot/only-dev-server',
  './src/index.jsx'
],
```

如果你启动或者重启webpack dev server, 它将会报错：missing Voting component。让我们先写第一版来修复这个问题：
```js
// src/components/Voting.jsx

import React from 'react';
import Button from './Button';

export default class Voting extends React.Component {
    constructor(props) {
        super(props);
    }

    getPair() {
        return this.props.pair;
    }

    render() {
        return (
            <div className="voting">
                {this.getPair().map((entry, index) =>
                    <Button key={index} entry={entry} />
                )}
            </div>
        );
    }
}


// src/components/Button.jsx

import React from 'react';

export default class Button extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
          <button>{this.props.entry}</button>
        );
    }
}
```

这会将条目渲染成一对按钮。你应该可以在浏览器中看到它们。
```zsh
webpack-dev-server --hot --inline
```

试着改变组件中的代码，你会看到它是如何立即应用于浏览器的。不需要重启，不需要页面重加载。是更快速的反馈！

现在我们也可以为我们的功能添加第一个单元测试，它被放在voting_spec.jsx中：
```js
// test/components/Voting_spec.jsx

import Voting from '../../src/components/Voting';

describe('Voting', () => {

});
```

为了测试组件基于**pair**属性渲染这些按钮，我们应该渲染它然后查看输出结果。为了在单元测试中渲染组件，我们可以使用
[renderIntoDocument](https://facebook.github.io/react/docs/test-utils.html#renderintodocument)帮助函数。
它包含在我们将要安装的React test utilities package。
```zsh
npm install --save react-addons-test-utils
```

------

```js
// test/components/Voting_spec.jsx

import Voting  from '../../src/components/Voting';
import React from 'react';
import ReactDOM from 'react-dom';
import {
    renderIntoDocument
} from 'react-addons-test-utils';


describe('Voting', () => {

    it('renders a pair of buttons', () => {
        const component = renderIntoDocument(
          <Voting pair={["Trainspotting", "28 Days Later"]}/>
        );
    })
});
```

一旦组件成功渲染，我们可以使用另外一个帮助函数[scryRenderedDOMComponentsWithTag](https://facebook.github.io/react/docs/test-utils.html#scryrendereddomcomponentswithtag)
来找到我们期望中的 **button** 元素。我们期望得到两个按钮，并且按钮的内容分别对应两个条目。
```js
// test/Voting_spec.jsx

import Voting  from '../../src/components/Voting';
import React from 'react';
import ReactDOM from 'react-dom';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithTag
} from 'react-addons-test-utils';
import {expect} from 'chai';


describe('Voting', () => {

    it('renders a pair of buttons', () => {
        const component = renderIntoDocument(
          <Voting pair={["Trainspotting", "28 Days Later"]}/>
        );

        const buttons = scryRenderedDOMComponentsWithTag(component, 'button')

        expect(buttons.length).to.equal(2);
        expect(buttons[0].textContent).to.equal("Trainspotting");
        expect(buttons[1].textContent).to.equal("28 Days Later");
    })

});
```

如果现在你运行测试，你应该看到它通过了测试：
```zsh
npm run test
```

当这些按钮中的一个被点击，组件应该invoke一个回调函数。和条目对一样，会掉函数也应该作为props传递给组件。

让我们更进一步为它添加单元测试。我们可以使用React`s test utilities中的[Situmate](https://facebook.github.io/react/docs/test-utils.html#simulate)
对象模拟一次点击。

```js
// test/components/Voting_spec.jsx

describe('Voting', () => {

  //..

    it('invokes callback when a button is clicked', () => {
        let votedWith;
        const vote = (entry) => votedWith = entry;

        const component = renderIntoDocument(
            <Voting pair={["Trainspotting", "28 Days Later"]}
                    vote={vote}/>
        );
        const buttons = scryRenderedDOMComponentsWithTag(component, 'button');
        Simulate.click(buttons[0]);

        expect(votedWith).to.equal('Trainspotting');
    })

});
```

让这个测试通过很简单。我们只需要使用button的 **onClick**处理程序，使用正确的条目invoke **vote**。
```js
// src/components/Voting.jsx

import React from 'react';

export default React.createClass({
  getPair: function() {
    return this.props.pair || [];
  },
  render: function() {
    return <div className="voting">
      {this.getPair().map(entry =>
        <button key={entry}
                onClick={() => this.props.vote(entry)}>
          <h1>{entry}</h1>
        </button>
      )}
    </div>;
  }
});
```

这是我们使用纯函数管理用户输入和actions的常用做法：组件本身不会做很多这类actions。它们只是调用props中的回调函数。

一旦用户在一对条目中投完票，我们就不能让他们再次投票。虽然我们能够在组件state中内部处理它，为了努力保证我们的组件pure,
因此我们应该试着外部化这个逻辑。组件会接收一个 **hasVoted**属性，现在我们使用假数据模拟。
```js
import React from 'react';
import ReactDOM from 'react-dom';
import Voting from './components/Voting';

const pair = ['Trainspotting', '28 Days Later'];

ReactDOM.render(
    <Voting pair = {pair} hasVoted="Trainspotting" />,
    document.getElementById('app')
);
```

我们可以很轻易的完成这个功能：
```js
// src/components/Voting.jsx

import React from 'react';

export default React.createClass({
  getPair: function() {
    return this.props.pair || [];
  },
  isDisabled: function() {
    return !!this.props.hasVoted;
  },
  render: function() {
    return <div className="voting">
      {this.getPair().map(entry =>
        <button key={entry}
                disabled={this.isDisabled()}
                onClick={() => this.props.vote(entry)}>
          <h1>{entry}</h1>
        </button>
      )}
    </div>;
  }
});
```

我们还要给用户投票的按钮添加一个小标签，以便它们清楚发生了什么。对于条目与 **hasVoted** props匹配的按钮，该
标签应该可见。我们可以增加一个新的帮助函数 **hasVotedFor** 来确定是否渲染该标签。
```js
src/components/Voting.jsx

import React from 'react';

export default React.createClass({
  getPair: function() {
    return this.props.pair || [];
  },
  isDisabled: function() {
    return !!this.props.hasVoted;
  },
  hasVotedFor: function(entry) {
    return this.props.hasVoted === entry;
  },
  render: function() {
    return <div className="voting">
      {this.getPair().map(entry =>
        <button key={entry}
                disabled={this.isDisabled()}
                onClick={() => this.props.vote(entry)}>
          <h1>{entry}</h1>
          {this.hasVotedFor(entry) ?
            <div className="label">Voted</div> :
            null}
        </button>
      )}
    </div>;
  }
});
```
投票界面最后需要的是如果出现了胜者，它应该替换掉已经渲染的投票按钮，并且立即显示出来。这里或许应该有另外一个winner props.
再一次，我们在真实数据插入前可以临时用假数据来代替。
```js
// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import Voting from './components/Voting';

const pair = ['Trainspotting', '28 Days Later'];

ReactDOM.render(
  <Voting pair={pair} winner="Trainspotting" />,
  document.getElementById('app')
);
```

我们可以有选择的渲染赢者dic还是按钮来解决这个问题。
```js
// src/components/Voting.jsx

import React from 'react';

export default React.createClass({
  getPair: function() {
    return this.props.pair || [];
  },
  isDisabled: function() {
    return !!this.props.hasVoted;
  },
  hasVotedFor: function(entry) {
    return this.props.hasVoted === entry;
  },
  render: function() {
    return <div className="voting">
      {this.props.winner ?
        <div ref="winner">Winner is {this.props.winner}!</div> :
        this.getPair().map(entry =>
          <button key={entry}
                  disabled={this.isDisabled()}
                  onClick={() => this.props.vote(entry)}>
            <h1>{entry}</h1>
            {this.hasVotedFor(entry) ?
              <div className="label">Voted</div> :
              null}
          </button>
        )}
    </div>;
  }
});
```

这是我们所需要的功能，但是渲染代码还很凌乱。如果我们从中提取一些单独的组件，以便投票屏幕组件呈现Winner组件
或者Vote组件。现在开始编写Winner组件，其实它只是一个div:
```js
src/components/Winner.jsx
import React from 'react';

export default React.createClass({
  render: function() {
    return <div className="winner">
      Winner is {this.props.winner}!
    </div>;
  }
});
```

现在Voting组件仅仅决定需要渲染哪个组件：
```js
src/components/Voting.jsx

import React from 'react';
import Winner from './Winner';
import Vote from './Vote';

export default React.createClass({
  render: function() {
    return <div>
      {this.props.winner ?
        <Winner ref="winner" winner={this.props.winner} /> :
        <Vote {...this.props} />}
    </div>;
  }
});
```

注意我们对Winner组件添加了[ref](https://facebook.github.io/react/docs/more-about-refs.html)。有时在
单元测试中我们要使用它来抓取相关DOM节点。

这是我们的纯Voting组件！注意我们还没有真正的实现任何逻辑：虽然有一些按钮，但是我们并没有指定它们具体怎么做，除了
invoke回调。我们的组件仅仅关注于UI界面渲染。当我们将UI和Redux store连接在一起时，应用程序逻辑将在后面介绍。

在我们继续编写代码前，我们需要先为我们添加的新功能写单元测试。首先，hasVoted props的出现应该导致投票按钮变为
禁用。
```js
// test/components/Voting_spec.jsx

it('disables buttons when user has voted', () => {
  const component = renderIntoDocument(
    <Voting pair={["Trainspotting", "28 Days Later"]}
            hasVoted="Trainspotting" />
  );
  const buttons = scryRenderedDOMComponentsWithTag(component, 'button');

  expect(buttons.length).to.equal(2);
  expect(buttons[0].hasAttribute('disabled')).to.equal(true);
  expect(buttons[1].hasAttribute('disabled')).to.equal(true);
});
```

**vote**标签应该出现在条目与**hasVoted** props相匹配的按钮上。
```js
// test/components/Voting_spec.jsx

it('adds label to the voted entry', () => {
  const component = renderIntoDocument(
    <Voting pair={["Trainspotting", "28 Days Later"]}
            hasVoted="Trainspotting" />
  );
  const buttons = scryRenderedDOMComponentsWithTag(component, 'button');

  expect(buttons[0].textContent).to.contain('Voted');
});
```

当出现winner属性，应该不渲染按钮，取而代之的是winner元素。
```js
//test/components/Voting_spec.jsx

it('renders just the winner when there is one', () => {
  const component = renderIntoDocument(
    <Voting winner="Trainspotting" />
  );
  const buttons = scryRenderedDOMComponentsWithTag(component, 'button');
  expect(buttons.length).to.equal(0);

  const winner = ReactDOM.findDOMNode(component.refs.winner);
  expect(winner).to.be.ok;
  expect(winner.textContent).to.contain('Trainspotting');
});
```

<h3> 不可变数据和纯渲染</h3>

我们之前已经讨论了不可变数据的优点，但是当我们把它和React结合起来使用另外会有一个好处：如果我们的组件
属性只使用不可变数据，作为纯组件来编写它，我们可以让React使用一种更有效的策略来检测属性的变化。

这是通过使用[add-on package](https://www.npmjs.com/package/react-addons-pure-render-mixin)中的
[pureRenderMixin](https://facebook.github.io/react/docs/pure-render-mixin.html)实现的。当这个
mixin被添加到组件中，它改变了React检查组件props(or states)变化的方式。它并不是深层次的比较，只是浅比较
(shouldComponentUpdate skips updates for the whole component subtree. Make sure all the children
components are also "pure".)这种方式将快得多。
 
我们可以这样做的原因是，根据定义，在不可变数据的内部绝对不可能发生变化。如果一个组件的所有props全是不可变数据，
如果在两次渲染中组件props保持相同的值，就没有必要再次渲染，完全可以跳过它。

我们可以通过编写一些单元测试具体的了解它。我们的组件应该是纯的，所以我们如果给它一个可变数组，然后在数组中发生
变化。它不应该被重新渲染：
```js
// test/components/Voting_spec.jsx

  it('renders as a pure component', () => {
       const pair = ['Trainspotting', '28 Days Later'];
       const container = document.createElement('div');
       let component = ReactDOM.render(
           <Voting pair={pair}/>,
           container
       );
       let firstButton = scryRenderedDOMComponentsWithTag(component, 'button')[0];
       expect(firstButton.textContent).to.equal('Trainspotting');

       
       pair[0] = 'Sunshine';
       component = ReactDOM.render(
            <Voting pair={pair} />,
            container
       );
       firstButton = scryRenderedDOMComponentsWithTag(component, 'button')[0];
       expect(firstButton.textContent).to.equal('Trainspotting');
    });
```

---

没有使用 **renderIntoDocument**,我们通过手动构建父节点<div>,并且渲染它两次，这样我们可以操纵再渲染(re-rendering)

---

我们在props中明确的设置一个新的immutable list, 让变化反映到UI界面中：
```js
// test/components/Voting_spec.jsx


import React from 'react';
import ReactDOM from 'react-dom';
import {
  renderIntoDocument,
  scryRenderedDOMComponentsWithTag,
  Simulate
} from 'react-addons-test-utils';
import {List} from 'immutable';
import Voting from '../../src/components/Voting';
import {expect} from 'chai';

describe('Voting', () => {

  // ...

  it('does update DOM when prop changes', () => {
    const pair = List.of('Trainspotting', '28 Days Later');
    const container = document.createElement('div');
    let component = ReactDOM.render(
      <Voting pair={pair} />,
      container
    );

    let firstButton = scryRenderedDOMComponentsWithTag(component, 'button')[0];
    expect(firstButton.textContent).to.equal('Trainspotting');

    const newPair = pair.set(0, 'Sunshine');
    component = ReactDOM.render(
      <Voting pair={newPair} />,
      container
    );
    firstButton = scryRenderedDOMComponentsWithTag(component, 'button')[0];
    expect(firstButton.textContent).to.equal('Sunshine');
  });

});
```

此时运行测试所显示的结果和我们预期中的不同：它在两种情况下都更新了UI，这意味着它深入检查了
props,这是我们使用不可变数据想要避免的。

当我们在组件中启用pure render mixin时，一切都会到位。我们需要先安装它的包：
```zsh
npm install --save react-addons-pure-render-mixin
```

现在我们将它混合进我们的组件：
```js
// src/components/Voting.jsx
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Winner from './Winner';
import Vote from './Vote';

export default React.createClass({
  mixins: [PureRenderMixin],
  // ...
});

//src/components/Vote.jsx
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],
  // ...
});

// src/components/Winner.jsx
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],
  // ...
});
```

<h3 id="Writing_The_UI_for_The_Results_Screen_And_Handling_Routing">编写投票结果界面UI以及处理路由</h3>

随着投票界面全部完成，让我们切换到应用程序另一个重要页面：显示投票结果页面。

这里显示的数据与投票界面是相同的条目对，并且包含每个条目的投票数。另外，页面的底部将有一个小按钮。它可以让投票发起人
开展下一组投票环节。

现在我们有两个独立的页面，其中每一个都应该在任何时间显示。为了在它们中间作出选择，使用URL路径应该是个好主意：我们可以
用根路径 **#/** 来显示投票界面，使用路径 **#／result** 来显示投票结果界面。

通过[react-router](https://github.com/ReactTraining/react-router)库可以轻易的做到这一点：使用它我们可以将不同
组件关联到不同路径上去。让我们在项目中添加它：
```zsh
npm install --save react-router@3.0.0
```

我们现在可以配置我们的路由路径，路由器带有一个名为Route的React组件，它可以被用来定义一个路由表。现在，我们只有一条路由：
```js
// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {Route} from 'react-router';
import App from './components/App';
import Voting from './components/Voting';

const pair = ['Trainspotting', '28 Days Later'];

const routes = <Route component={App}>
  <Route path="/" component={Voting} />
</Route>;

ReactDOM.render(
  <Voting pair={pair} />,
  document.getElementById('app')
);
```

我们现在有一个路由，我们已经配置它指向Voting组件。我们需要做的另外一件事是在配置中定义root Route.它指向了App组件，我们
之后将会建立它。

root route组件的用途是渲染所有路由中相同的部分。我们的 **App**组件应该像下面这样：
```js
// src/components/App.jsx

import React from 'react';
import {List} from 'immutable';

const pair = List.of('Trainspotting', '28 Days Later');

export default React.createClass({
  render: function() {
    return React.cloneElement(this.props.children, {pair: pair});
  }
});
```

这个组件除了渲染它的子组件外什么也不做，预期将以 **children** prop的形式给出。这是react-router包为我们做的。它插入当前
路由定义的组件。由于目前我们只有 **Voting**一个路由，现在这个组件永远渲染 **Voting**。

注意我们已经将 **pair**数据从index.jsx移动到了App.jsx中。我们使用React的[cloneElement](https://facebook.github.io/react/docs/react-api.html#cloneelement)
创建一个绑定了自定义**pair** props的组件。这只是一个临时性方法，后面我们会移除cloning调用。

我们现在可以切换到 **index.jsx**,我们可以启动Router,并初始化我们的程序:
```js
// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import App from './components/App';
import Voting from './components/Voting';

const routes = <Route component={App}>
  <Route path="/" component={Voting} />
</Route>;

ReactDOM.render(
  <Router history={hashHistory}>{routes}</Router>,
  document.getElementById('app')
);
```

我们现在使用react-router的Router组件作为应用程序的根组件，指示它使用基于 **#hash** 的历史记录机制(而不是HTML5 history API). 
我们将我们的路由表作为子组件传给它。

有了这个，我们恢复了我们应用程序之前的功能：但它目前只渲染 **Voting**组件。这一次是通过React router来完成的，这意味着我们现在
可以轻易的添加更多的路由。让我们来完成Result界面，他将被存储在一个Results组件中。
```js
// src/index.jsx


import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import App from './components/App';
import Voting from './components/Voting';
import Results from './components/Results';

const routes = <Route component={App}>
  <Route path="/results" component={Results} />
  <Route path="/" component={Voting} />
</Route>;

ReactDOM.render(
  <Router history={hashHistory}>{routes}</Router>,
  document.getElementById('app')
);

```

现在我们再使用<Route>组件来指定'/results'路径，同时我们应该使用 **Results**组件。其余部分仍然交给 **Voting** 组件来完成。
 
让我们来一个简易的 **Results** 组件实现来观察路由如何工作：
```js
// src/components/Results.jsx

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],
  render: function() {
    return <div>Hello from results!</div>
  }
});
```
如果你现在使用浏览器访问[http://localhost:8080/#/results](http://localhost:8080/#/results),你应该可以看到来自Results
组件的信息。此外，根路径也会显示投票按钮。你还可以前进或后退按钮在不同路由之前切换，并且当应用程序开启时，可见的组件都可以被切换。
这是react router在行动！

---

这是我们在本教程使用react-router使用的全部功能。这个库能做的不仅仅于此。你可以看它的[文档](https://github.com/ReactTraining/react-router)，
了解所有你能做的事情。

---

现在我们有了Results组件，让我们继续前进用它一些有用的事。它应该显示目前正在被投票的两个条目：
```js
// src/components/Results.jsx

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],
  getPair: function() {
    return this.props.pair || [];
  },
  render: function() {
    return <div className="results">
      {this.getPair().map(entry =>
        <div key={entry} className="entry">
          <h1>{entry}</h1>
        </div>
      )}
    </div>;
  }
});
```

由于这是投票结果页面，所以实际上它也应该显示票数。这是人们想在屏幕看到的。让我们先从App组件传递一个tally Map：
```js
// src/components/App.jsx

import React from 'react';
import {List, Map} from 'immutable';

const pair = List.of('Trainspotting', '28 Days Later');
const tally = Map({'Trainspotting': 5, '28 Days Later': 4});

export default React.createClass({
  render: function() {
    return React.cloneElement(this.props.children, {
      pair: pair,
      tally: tally
    });
  }
});
```

现在我们可以调整结果组件以显示这些数字：
```js
// src/components/Results.jsx

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],
  getPair: function() {
    return this.props.pair || [];
  },
  getVotes: function(entry) {
    if (this.props.tally && this.props.tally.has(entry)) {
      return this.props.tally.get(entry);
    }
    return 0;
  },
  render: function() {
    return <div className="results">
      {this.getPair().map(entry =>
        <div key={entry} className="entry">
          <h1>{entry}</h1>
          <div className="voteCount">
            {this.getVotes(entry)}
          </div>
        </div>
      )}
    </div>;
  }
});
```

在这一点上，让我们先换个方向，为Results界面编写单元测试，以确保我们之后不会破坏它。

我们希望组件能够为每一个条目渲染一个div,并且在div中展示条目名称以及投票数。对于没有票数的条目，相应显示的票数
应该为0：
```js
// test/components/Results_spec.jsx

import React from 'react';
import {
  renderIntoDocument,
  scryRenderedDOMComponentsWithClass
} from 'react-addons-test-utils';
import {List, Map} from 'immutable';
import Results from '../../src/components/Results';
import {expect} from 'chai';

describe('Results', () => {

  it('renders entries with vote counts or zero', () => {
    const pair = List.of('Trainspotting', '28 Days Later');
    const tally = Map({'Trainspotting': 5});
    const component = renderIntoDocument(
      <Results pair={pair} tally={tally} />
    );
    const entries = scryRenderedDOMComponentsWithClass(component, 'entry');
    const [train, days] = entries.map(e => e.textContent);

    expect(entries.length).to.equal(2);
    expect(train).to.contain('Trainspotting');
    expect(train).to.contain('5');
    expect(days).to.contain('28 Days Later');
    expect(days).to.contain('0');
  });

});
```

接下来，我们讨论"next"按钮，它被用来开展下一组投票。

从组件的视角来看，在属性中应该有一个回调函数。当"next"按钮被点击时，组件应该调用回调函数。我们可以为此编写
单元测试，它与我们为投票按钮编写的非常相似。
```js
// src/components/Results.jsx

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],
  getPair: function() {
    return this.props.pair || [];
  },
  getVotes: function(entry) {
    if (this.props.tally && this.props.tally.has(entry)) {
      return this.props.tally.get(entry);
    }
    return 0;
  },
  render: function() {
    return <div className="results">
      <div className="tally">
        {this.getPair().map(entry =>
          <div key={entry} className="entry">
            <h1>{entry}</h1>
            <div class="voteCount">
              {this.getVotes(entry)}
            </div>
          </div>
        )}
      </div>
      <div className="management">
        <button ref="next"
                className="next"
                onClick={this.props.next}>
          Next
        </button>
      </div>
    </div>;
  }
});
```

最后，和投票界面类似，当只有一个条目时，投票结果界面将展示胜者：
```js
// test/components/Results_spec.jsx

it('renders the winner when there is one', () => {
  const component = renderIntoDocument(
    <Results winner="Trainspotting"
             pair={["Trainspotting", "28 Days Later"]}
             tally={Map()} />
  );
  const winner = ReactDOM.findDOMNode(component.refs.winner);
  expect(winner).to.be.ok;
  expect(winner.textContent).to.contain('Trainspotting');
});

```

我们可以简单的复用为投票界面编写的Winner组件。如果存在一位胜者，我们渲染它替代常规的投票结果页面：
```js
// src/components/Results.jsx
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Winner from './Winner';

export default React.createClass({
  mixins: [PureRenderMixin],
  getPair: function() {
    return this.props.pair || [];
  },
  getVotes: function(entry) {
    if (this.props.tally && this.props.tally.has(entry)) {
      return this.props.tally.get(entry);
    }
    return 0;
  },
  render: function() {
    return this.props.winner ?
      <Winner ref="winner" winner={this.props.winner} /> :
      <div className="results">
        <div className="tally">
          {this.getPair().map(entry =>
            <div key={entry} className="entry">
              <h1>{entry}</h1>
              <div className="voteCount">
                {this.getVotes(entry)}
              </div>
            </div>
          )}
        </div>
        <div className="management">
          <button ref="next"
                   className="next"
                   onClick={this.props.next}>
            Next
          </button>
        </div>
      </div>;
  }
});
```

---

这个组件分解成更小的组件是有益的。也许一个Tally组件用于显示一对条目，如果你喜欢的话，去做重构吧！

---

这就是我们这个简单的应用在UI方面需要的！我们写的组件还没有做任何事情，因为它们没有连接到任何真实的数据或者
操作。然而令人惊讶的是，我们在没有需要任何数据的情况下，可以"走这么远"。我们已经向这些组件注入一些简单的数据，
只关注于UI的结构。

现在我们已经有了UI，让我们来谈谈如何通过将它的输入输出连接到一个Redux store来实现它。

<h3 id='Introducing_A_Client-Side_Redux_Store'>客户端Redux store介绍</h3>

实际上设计Redux是用来作为UI应用程序的state容器，就像我们正在构建的过程。到目前为止我们只是在服务器端使用了
Redux，并且发现在服务器端它也非常有用。现在我们准备看看Redux和React如何结合起来使用，这可以说是最常用的了！

与服务器端一样，我们从应用程序state开始入手。这里的state与服务器端非常类似，这不是偶然的。

我们有两个UI界面。两个界面中我们都展示了将要被投票的条目对。所以有一个state是具有条目对的vote entry：
![vote_client_pair.png](./image/vote_client_pair.png)

除此这外，投票结果界面将展示投票数。这也应该在vote entry中：
![vote_client_tally.png](./image/vote_client_tally.png)

当用户已经在当前条目对中投过票，这是需要追踪的state:

![vote_client_hasvoted.png](./image/vote_client_hasvoted.png)

当出现了胜者，我们只需要这一个state:

![vote_server_tree_winner.png](./image/vote_server_tree_winner.png)

注意客户端的state除了 **hasVoted**之外，都是服务器端state的子集。

下面我们实现Redux Store将使用的核心逻辑、actions和reducers. 它们应该是什么样的呢？

我们可以考虑当应用程序运行时可能导致state改变的情况。state变化的一种来源是用户的actions.我们现在UI界面有两个
用户交互：

* 在投票页面用户点击投票按钮进行投票
* 在投票结果页面用户点击NEXT按钮开展下一步。

另外，我们的服务器被设置为向我们发送当前state. 我们马上编写代码来接收它。这是state改变的第三个来源。

我们可以从服务器state更新开始，因为这是最直接的一个。

早些时候，我们设置服务器发送一个 **state** 事件，它的有效负载几乎完全是我们的客户端state tree. 我们这么设计
并不是巧合。从客户端reducer的视角来看，存在actions可以接收来自服务器端state快照并把它合并进客户端state中是有意义的。
actions应该像下面这样：
```js

{
  type: 'SET_STATE',
  state: {
    vote: { ... }
  }
}
```

让我们添加一些单元测试来看看这是如何工作的。我们期望有一个reducer,给定一个上述动作，将其有效负载合并到当前state:
```js
/ test/reducet_spec.js

/**
 * Created on 11/12/2016.
 */

import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';

import reducer from '../src/reducer';

describe('reducer', () => {

    it('handles SET_STATE', () => {
        const initialState = Map();
        const action = {
            type: 'SET_STATE',
            state: Map({
                vote: Map({
                    pair: List.of('Trainspotting', '28 Days Later'),
                    tally: Map({Trainspotting: 1})
                })
            })
        };
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Trainspotting', '28 Days Later'],
                tally: {Trainspotting: 1}
            }
        }));
    });

});
```

Reducer应该可以接收普通的javascript数据结构而不是Immutable data structure,这是因为它实际上是通过
socket获得的。当它返回下一个state时，它应该被转换成Immutable data structure.
```js
// test/reducer_spec.js


it('handles SET_STATE with plain JS payload', () => {
  const initialState = Map();
  const action = {
    type: 'SET_STATE',
    state: {
      vote: {
        pair: ['Trainspotting', '28 Days Later'],
        tally: {Trainspotting: 1}
      }
    }
  };
  const nextState = reducer(initialState, action);

  expect(nextState).to.equal(fromJS({
    vote: {
      pair: ['Trainspotting', '28 Days Later'],
      tally: {Trainspotting: 1}
    }
  }));
});
```

作为reducer约定的一部分，**undefined** 的初始状态应该被reducer正确的初始化为Immutable data structure:
```js
// test/reducer_spec.js


it('handles SET_STATE without initial state', () => {
  const action = {
    type: 'SET_STATE',
    state: {
      vote: {
        pair: ['Trainspotting', '28 Days Later'],
        tally: {Trainspotting: 1}
      }
    }
  };
  const nextState = reducer(undefined, action);

  expect(nextState).to.equal(fromJS({
    vote: {
      pair: ['Trainspotting', '28 Days Later'],
      tally: {Trainspotting: 1}
    }
  }));
});
```

这是我们的测试spec，让我们来看看如何实现它。我们应该由reducer模块导出一个reducer函数：
```js
//  src/reducer.js

/**
 * Created on 11/12/2016.
 */

import {Map} from 'immutable';

export default function reducer(state = Map(), action) {


    return state;
}
```

Reducer应该处理 **SET_STATE** action. 在事件处理函数的内部，我们实际上只是将给定的新的state与旧的state
合并起来，使用Map的[merge](https://facebook.github.io/immutable-js/docs/#/Map/merge)方法。这种方法
完全可以让测试通过！
```js
// src/reducer.js

/**
 * Created on 11/12/2016.
 */

import {Map} from 'immutable';

function setState(state, newState) {
    return state.merge(newState);
}

export default function reducer(state = Map(), action) {

    switch (action.type) {
        case 'SET_STATE' :
            return setState(state, action.state);
    }

    return state;
}
```

---

注意在这里我们没有将 "核心"逻辑模块(setState)与reducer模块分离。这是因为目前客户端reducer的逻辑太简单了。
在这里我们只是做了合并操作，然而在服务器端可是有我们整个投票系统的逻辑。如果有需要的话，在客户端添加一些分离
操作是更合适的。

---

剩下的两个导致状态发生变化的事件是：投票和点击'NEXT'按钮。由于这两个事件都涉及到与服务器端交互，我们在得到了
适当的服务器通信架构之后再来编写它们。

现在我们有个reducer,我们就可以根据它启动(spin up)一个Rudex Store.是时候在项目中添加Redux了：
```js
npm install --save redux
```

入口点 **index.js** 是一个很好的启动Redux store的地方。让我们模拟一些数据，在这些数据上dispatching 
**SET_STATE** action。(这只是临时的，直到我们得到真正的数据。）

```js
// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import {createStore} from 'redux';
import reducer from './reducer';
import App from './components/App';
import Voting from './components/Voting';
import Results from './components/Results';

const store = createStore(reducer);
store.dispatch({
  type: 'SET_STATE',
  state: {
    vote: {
      pair: ['Sunshine', '28 Days Later'],
      tally: {Sunshine: 2}
    }
  }
});

const routes = <Route component={App}>
  <Route path="/results" component={Results} />
  <Route path="/" component={Voting} />
</Route>;

ReactDOM.render(
  <Router history={hashHistory}>{routes}</Router>,
  document.getElementById('app')
);
```

这是我们的store,现在我们如何从Store中获得state并将它传入React组件中呢？

<h3 id='Getting_Data_In_from_Redux_to_React' > react从Redux获得数据</h3>

我们现在已经有了持有应用程序immutable data的Redux Store。我们还有将immutable data作为输入的stateless
React组件。这两者十分合适：如果我们能够想出一种方法，总是可以从Redux Store中获取最新的数据并传给React组件，
这将是完美的。当state发生变化时React会重新渲染组件，同时pure render mixin(现在已经变为React.pureComponent)
会保证不需要重新渲染的UI界面不会被渲染.(shallowly compare)

我们可以使用[react-redux](https://github.com/rackt/react-redux)包中提供的Redux React绑定，而不是自己去编写这样的同步代码：
```zsh
npm install --save react-redux
```

react-redux的主要思想是获取我们的纯组件并且通过两件事将它连接到Redux store：

1. 将Store state映射到组件输入props.
2. 将actions映射到组件输出回调(output callback)props.

在任何可能发生之前，我们需要将我们的顶级应用程序组件包装在react-redux Provider组件中。这将我们的组件树与一个Redux store连接起来，
可以使我们在后面为单独的组件作出映射。

我们在Router组件附近放入Provider组件。这将导致Provider组件成为我们应用程序组件的祖先：
```js

// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import App from './components/App';
import {VotingContainer} from './components/Voting';
import Results from './components/Results';

const store = createStore(reducer);
store.dispatch({
  type: 'SET_STATE',
  state: {
    vote: {
      pair: ['Sunshine', '28 Days Later'],
      tally: {Sunshine: 2}
    }
  }
});

const routes = <Route component={App}>
  <Route path="/results" component={Results} />
  <Route path="/" component={VotingContainer} />
</Route>;

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>{routes}</Router>
  </Provider>,
  document.getElementById('app')
);

});
```

现在我们应该考虑哪些组件需要"连线"，以便获得来自Store的数据。我们有五个组件，它们可以被分为3类：

* 根组件App实际上并不需要任何东西，因为它没有使用任何数据。
* Vote和Winner组件被父组件使用，并且由父组件传递给他们所需要的props.因此它们也不需要"连线"。
* 剩下的是我们在routes中使用的 **Voting** 和 **Results** 组件。它们目前的做法是从App组件中获得假数据。这些组件是需要"连线"
到store上的。

让我们先从 **Voting** 组件开始。react-redux有一个 **connect** 函数可以做一个组件的"连线"。它获取一个mapping函数作为
argument和返回另外一个接收React组件的函数：
```js
connect(mapStateToProps)(SomeComponent);
```
 
Mappint函数的功能是将来自Redux Store的state映射成对象的props. 这些props会被合并进已连接的组件的props中。在Voting这种情况
下，我们只需要映射state中的 **pair** 和 **winner**：
```js

// src/components/Voting.jsx

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux';
import Winner from './Winner';
import Vote from './Vote';

const Voting = React.createClass({
  mixins: [PureRenderMixin],
  render: function() {
    return <div>
      {this.props.winner ?
        <Winner ref="winner" winner={this.props.winner} /> :
        <Vote {...this.props} />}
    </div>;
  }
});

function mapStateToProps(state) {
  return {
    pair: state.getIn(['vote', 'pair']),
    winner: state.get('winner')
  };
}

connect(mapStateToProps)(Voting);

export default Voting;
```

这不是很正确。真正的函数式风格， **connect** 函数实际上并没有运行并改变 **Voting** 组件。 **Voting** 仍然是一个纯的、无连接的组件。
取而代之，**connect** 返回一个已连接版本的 **Voting**。这意味着我们现在的代码是不起作用的。我们需要获得返回值，我们称之为
**VotingContainer** ：
```js

// src/components/Voting.jsx

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import Winner from './Winner';
import Vote from './Vote';

export const Voting = React.createClass({
  mixins: [PureRenderMixin],
  render: function() {
    return <div>
      {this.props.winner ?
        <Winner ref="winner" winner={this.props.winner} /> :
        <Vote {...this.props} />}
    </div>;
  }
});

function mapStateToProps(state) {
  return {
    pair: state.getIn(['vote', 'pair']),
    winner: state.get('winner')
  };
}

export const VotingContainer = connect(mapStateToProps)(Voting);
```

模块现在将导出两个组件：纯组件 **Voting** 和已连接组件 **VotingContainer**。React-redux文档称前者为"dumb"组件，后者为
"start"组件。我更倾向于"pure"和"connected"。这样叫的话你可以理解它们之间的关键区别：

* pure/dumb组件完全是由给定的props驱动的。它是纯函数的等价组件。
* connected/smart组件，使用一些保持它本身与Redux store中变化的state同步的逻辑来包装纯组件。这层逻辑是由react-redux提供的。

我们应该更新我们的路由表，使用 **VotingContainer** 替换 **Voting**。 一旦我们这么做，投票界面将于我们放入Redux store中的
数据保持一致。
```js

// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import App from './components/App';
import {VotingContainer} from './components/Voting';
import Results from './components/Results';

const store = createStore(reducer);
store.dispatch({
  type: 'SET_STATE',
  state: {
    vote: {
      pair: ['Sunshine', '28 Days Later'],
      tally: {Sunshine: 2}
    }
  }
});

const routes = <Route component={App}>
  <Route path="/results" component={Results} />
  <Route path="/" component={VotingContainer} />
</Route>;

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>{routes}</Router>
  </Provider>,
  document.getElementById('app')
);
```

此外，在对于Voting的单元测试中，我们需要改变我们的倒入方式，因为我们不再默认导出 **Voting**。
```js
// test/components/Voting_spec.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {
  renderIntoDocument,
  scryRenderedDOMComponentsWithTag,
  Simulate
} from 'react-addons-test-utils';
import {List} from 'immutable';
import {Voting} from '../../src/components/Voting';
import {expect} from 'chai';
```

关于测试代码的其他部分不需要改变。它们只是用来测试纯组件的，所以怎么都不会改变。我们只是包装了纯组件使它可以连接
到Redux store。

现在我们对投票结果页面应该使用相同的技巧。它同样需要 **pair** 和 **winner** 属性。此外它还需要 **tally**属性，
为了显示投票数：
```js
// src/components/Results.jsx

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import Winner from './Winner';

export const Results = React.createClass({
  mixins: [PureRenderMixin],
  getPair: function() {
    return this.props.pair || [];
  },
  getVotes: function(entry) {
    if (this.props.tally && this.props.tally.has(entry)) {
      return this.props.tally.get(entry);
    }
    return 0;
  },
  render: function() {
    return this.props.winner ?
      <Winner ref="winner" winner={this.props.winner} /> :
      <div className="results">
        <div className="tally">
          {this.getPair().map(entry =>
            <div key={entry} className="entry">
              <h1>{entry}</h1>
              <div className="voteCount">
                {this.getVotes(entry)}
              </div>
            </div>
          )}
        </div>
        <div className="management">
          <button ref="next"
                   className="next"
                   onClick={this.props.next}>
            Next
          </button>
      </div>
      </div>;
  }
});

function mapStateToProps(state) {
  return {
    pair: state.getIn(['vote', 'pair']),
    tally: state.getIn(['vote', 'tally']),
    winner: state.get('winner')
  }
}

export const ResultsContainer = connect(mapStateToProps)(Results);
```

在 **Index.jsx** 页面中，我们应该使用 **ResultsContainer** 组件来替换results路由中的 **Results**:
```js
// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import App from './components/App';
import {VotingContainer} from './components/Voting';
import {ResultsContainer} from './components/Results';

const store = createStore(reducer);
store.dispatch({
  type: 'SET_STATE',
  state: {
    vote: {
      pair: ['Sunshine', '28 Days Later'],
      tally: {Sunshine: 2}
    }
  }
});

const routes = <Route component={App}>
  <Route path="/results" component={ResultsContainer} />
  <Route path="/" component={VotingContainer} />
</Route>;

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>{routes}</Router>
  </Provider>,
  document.getElementById('app')
);
```

最后，在Results的单元测试中，我们应该修改 **Results** 组件的导入方式。
```js

// test/components/Results_spec.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {
  renderIntoDocument,
  scryRenderedDOMComponentsWithClass,
  Simulate
} from 'react-addons-test-utils';
import {List, Map} from 'immutable';
import {Results} from '../../src/components/Results';
import {expect} from 'chai';
```

这就是如何连接pure React component到一个Redux store上，以便它们可以从store中获得它们的数据。

对于只有一个根组件，没有使用路由的小应用来说，大多数情况下连接到根组件已经足够了。根组件接下来可以根据props向它的
children传播数据。对于使用路由的应用来说，像我们现在做的，连接每一个路由组件通常是个好主意。因为任何组件都是单独
连接，因此不同的策略可以用于不同的应用程序架构中。我认为无论什么时候使用普通的props是一个好主意，因为使用props可以
很容易看到什么数据进入，并且因为你不需要管理"连线"代码，这样可以减少工作量。

现在我们的UI界面可以从Redux获取数据，我们不再需要在 **App.jsx** 中加入props,因此它变得比之前更简单：
```js
// src/index.jsx

import React from 'react';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return this.props.children;
    }
}
```

<h3 id='Setting_Up_The_Socket.io_Client'> 安装Socket.io客户端</h3>

现在我们已经有了一个可以运行的Redux客户端程序，我们可以谈谈如何将它连接到我们在服务器上运行的其他Redux应用程序。它们两个
目前各自住在各自的宇宙中，在它们之间没有任何连接。

服务器已经准备好接收入站socket连接并向其发出投票state。另一方面，客户端有一个Redux store, 我们可以轻松的调度传入的数据。
我们现在需要做的是建立连接。

这首先要让基础设施到位。我们需要一种方法来建立浏览器到服务器的socket.io连接。为此，我们可以使用[socket.io-client library](http://socket.io/docs/client-api/)
,它等同于我们在服务器端使用的socket.io库。
```zsh
npm install --save socket.io-client
```

导入这个库之后，我们使用它提供的 **io**函数来建立与服务器之间的连接。假设我们与服务器端在同一个主机上，让我们连接到8090端口
(匹配我们在服务器端使用的端口号。)
```js
// src/index.jsx


import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import io from 'socket.io-client';
import reducer from './reducer';
import App from './components/App';
import {VotingContainer} from './components/Voting';
import {ResultsContainer} from './components/Results';

const store = createStore(reducer);
store.dispatch({
  type: 'SET_STATE',
  state: {
    vote: {
      pair: ['Sunshine', '28 Days Later'],
      tally: {Sunshine: 2}
    }
  }
});

const socket = io(`${location.protocol}//${location.hostname}:8090`);

const routes = <Route component={App}>
  <Route path="/results" component={ResultsContainer} />
  <Route path="/" component={VotingContainer} />
</Route>;

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>{routes}</Router>
  </Provider>,
  document.getElementById('app')
);
```

如果你现在使你的服务器运行起来，在浏览器中打开客户端程序并且检查网络流量，你应该看到了它生成了WebSocket连接并
开始在上面传输Socket.io heartbeats。

---

在开发过程中，页面中实际上是有两个Socket.io连接。一个是我们的应用程序，另外一个是支持Webpack热加载的。

---

<h3 id='Receiving_Actions_From_The_Server'> 从服务端接收Actions</h3>

我们现在已经有了socket.io连接，实际上我们不需要做很多工作来从中获取数据。服务器正在向我们发送 **state** events——
当我们连接上服务器时或者当状态发生变化时。我们只需要监听这些events。当我们获得了一个时，我们就可以dispatch一个
**SET_STATE**action给Redux store。我们已经有了相应的reducer来处理它：
```js
// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import io from 'socket.io-client';
import reducer from './reducer';
import App from './components/App';
import {VotingContainer} from './components/Voting';
import {ResultsContainer} from './components/Results';

const store = createStore(reducer);

const socket = io(`${location.protocol}//${location.hostname}:8090`);
socket.on('state', state =>
  store.dispatch({type: 'SET_STATE', state})
);

const routes = <Route component={App}>
  <Route path="/results" component={ResultsContainer} />
  <Route path="/" component={VotingContainer} />
</Route>;

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>{routes}</Router>
  </Provider>,
  document.getElementById('app')
);
```

注意我们已经去除了模拟的 **SET_STATE** dispatch。因为服务器将会给我们真实的数据，所以我们不再需要它。

观察UI界面——无论是Voting界面还是Results界面——现在都将会显示我们在服务器端定义的entries中的第一对条目。
我们的服务器端和客户端连接起来了！

<h3 id='Dispatching_Actions_From_React_Component'> 从react组件分发Actions</h3>

我们已经知道了如何从Redux store获得数据传递给UI界面。接下来我们讨论如何获得从UI界面发出的actions。

思考这个问题最好的场合应该是投票按钮。在我们已经建立的UI界面中，我们假设 **Voting**组件可以接收一个 **vote**
属性，它实质上是一个回调函数。当用户点击其中一个条目按钮，组件就会调用这个函数。但是实际上我们还没有提供这个
回调函数——除了在单元测试中。

当一个用户作出投票操作时到底会发生什么呢？当然，投票应该很容易发送到服务器，我们过一会来讨论它。这个操作也涉及
到客户端逻辑：组件的 **hasVoted** 属性应该被设置，因此用户不能对同一对条目进行多次投票。

这将是 **SET_STATE** action之后的第二个客户端Rudex action。我们称它为 **vote**。它应该填充state Map中的
**hasVoted** 条目。
```js
// test/reducer_spec.js

it('handles VOTE by setting hasVoted', () => {
  const state = fromJS({
    vote: {
      pair: ['Trainspotting', '28 Days Later'],
      tally: {Trainspotting: 1}
    }
  });
  const action = {type: 'VOTE', entry: 'Trainspotting'};
  const nextState = reducer(state, action);

  expect(nextState).to.equal(fromJS({
    vote: {
      pair: ['Trainspotting', '28 Days Later'],
      tally: {Trainspotting: 1}
    },
    hasVoted: 'Trainspotting'
  }));
});
```

如果由于任何原因，对于目前没有处于投票节点的条目进行投票操作的话，不设置该条目是个好主意：
```js
// test/reducer_spec.js

it('does not set hasVoted for VOTE on invalid entry', () => {
  const state = fromJS({
    vote: {
      pair: ['Trainspotting', '28 Days Later'],
      tally: {Trainspotting: 1}
    }
  });
  const action = {type: 'VOTE', entry: 'Sunshine'};
  const nextState = reducer(state, action);

  expect(nextState).to.equal(fromJS({
    vote: {
      pair: ['Trainspotting', '28 Days Later'],
      tally: {Trainspotting: 1}
    }
  }));
});
```

下面是扩展后的reducer:
```js
// src/reducer.js

import {Map} from 'immutable';

function setState(state, newState) {
  return state.merge(newState);
}

function vote(state, entry) {
  const currentPair = state.getIn(['vote', 'pair']);
  if (currentPair && currentPair.includes(entry)) {
    return state.set('hasVoted', entry);
  } else {
    return state;
  }
}

export default function(state = Map(), action) {
  switch (action.type) {
  case 'SET_STATE':
    return setState(state, action.state);
  case 'VOTE':
    return vote(state, action.entry);
  }
  return state;
}
```

**hasVoted** 条目不应该一直存在于state中。当投票进行到下一对条目时，它应该被重新设置为了下一对条目可以进行投票。
我们应该在 **setState** 中来处理这个问题，在这里我们可以检查新的状态中条目对是否包含用户已经投票过的条目。如果
它不包含，我们应该去除掉 **hasVoted** 属性。
```js
// test/reducer_spec.js

it('removes hasVoted on SET_STATE if pair changes', () => {
  const initialState = fromJS({
    vote: {
      pair: ['Trainspotting', '28 Days Later'],
      tally: {Trainspotting: 1}
    },
    hasVoted: 'Trainspotting'
  });
  const action = {
    type: 'SET_STATE',
    state: {
      vote: {
        pair: ['Sunshine', 'Slumdog Millionaire']
      }
    }
  };
  const nextState = reducer(initialState, action);

  expect(nextState).to.equal(fromJS({
    vote: {
      pair: ['Sunshine', 'Slumdog Millionaire']
    }
  }));
});
```

我们可以在 **SET_STATE** action handler上组合一个 **resetVote** 函数来实现。
```js
// src/reducer.js

import {List, Map} from 'immutable';

function setState(state, newState) {
  return state.merge(newState);
}

function vote(state, entry) {
  const currentPair = state.getIn(['vote', 'pair']);
  if (currentPair && currentPair.includes(entry)) {
    return state.set('hasVoted', entry);
  } else {
    return state;
  }
}

function resetVote(state) {
  const hasVoted = state.get('hasVoted');
  const currentPair = state.getIn(['vote', 'pair'], List());
  if (hasVoted && !currentPair.includes(hasVoted)) {
    return state.remove('hasVoted');
  } else {
    return state;
  }
}

export default function(state = Map(), action) {
  switch (action.type) {
  case 'SET_STATE':
    return resetVote(setState(state, action.state));
  case 'VOTE':
    return vote(state, action.entry);
  }
  return state;
}
```

---

用于确认hasVoted属性是否适用于当前条目对的逻辑有一些问题。你可以在exercises找出一种方式来改进它。

---

我们还没有将 **hasVoted** 条目作为属性连接到 **Voting** 组件上，因此我们应该这么做：
```
// src/components/Voting.jsx

function mapStateToProps(state) {
  return {
    pair: state.getIn(['vote', 'pair']),
    hasVoted: state.get('hasVoted'),
    winner: state.get('winner')
  };
}
```

现在对于 **Voting** 组件，我们仍需要一个 **vote** 回调函数，它将导致新的action被分发。我们应该保证**Voting**
组件是纯的并且没有意识到actions或者Redux的存在。换句话说，这是react-redux中 **connect** 函数的另一用法。

不仅仅可以包装输入属性，react-redux还可以被用来包装输出actions。在我们实现之前，需要先介绍Redux另外一个核心概念：
Action creators。

我们已经知道Redux actions只是一些普通的对象(按照惯例),它有一个 **type** 属性和一些与actions相关的特定数据。我们
已经通过简单的对象字面量(object literals)来创建这些actions。然而，使用少量的工厂函数来代替生成actions是更合适的。
函数类似下面：
```js

function vote(entry) {
  return {type: 'VOTE', entry};
}
```

这些函数又被成为action creators。它们其实并没有做什么——它们只是返回action object的纯函数——但它们做的是封装动作对象
的内部结构，这样代码库中的其他部分不需要关心这些细节。Action creators还可以方便的记录在特定应用程序中可以被分发的所有
actions。如果这些信息以对象字面量的方式散布在代码库中，那么这些信息会非常难收集。

让我们新建一个包含action creators的文件，这些action creators定义了两个已经存在的客户端action。
```js
/**
 * Created on 12/12/2016.
 */

// src/action_creators.js

export function setState(state) {
    return {
        type: 'SET_STATE',
        state
    }
}

export function vote(entry) {
    return {
        type: 'VOTE',
        entry
    }
}
```

在 **index.jsx** 页面，我们可以在socket.io事件处理程序中使用 **setState** action creator。
```js
// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import io from 'socket.io-client';
import reducer from './reducer';
import {setState} from './action_creators';
import App from './components/App';
import {VotingContainer} from './components/Voting';
import {ResultsContainer} from './components/Results';

const store = createStore(reducer);

const socket = io(`${location.protocol}//${location.hostname}:8090`);
socket.on('state', state =>
  store.dispatch(setState(state))
);

const routes = <Route component={App}>
  <Route path="/results" component={ResultsContainer} />
  <Route path="/" component={VotingContainer} />
</Route>;

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>{routes}</Router>
  </Provider>,
  document.getElementById('app')
);
```

关于action creators一个整洁的方面是react-redux将它们连接到React组件的方式：在 **Voting** 组件上有**vote** 
回调属性，我们还有一个 **vote** action creator。它们俩有相同的名字：一个参数，它是被投票的条目。我们需要做的
仅仅是将action creators作为第二个参数传给react-redux **connect** 函数，接下来就会产生连接：
```js

src/components/Voting.jsx
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import Winner from './Winner';
import Vote from './Vote';
import * as actionCreators from '../action_creators';

export const Voting = React.createClass({
  mixins: [PureRenderMixin],
  render: function() {
    return <div>
      {this.props.winner ?
        <Winner ref="winner" winner={this.props.winner} /> :
        <Vote {...this.props} />}
    </div>;
  }
});

function mapStateToProps(state) {
  return {
    pair: state.getIn(['vote', 'pair']),
    hasVoted: state.get('hasVoted'),
    winner: state.get('winner')
  };
}

export const VotingContainer = connect(
  mapStateToProps,
  actionCreators
)(Voting);
```

这样做的影响是一个 **vote** 属性将传给 **Voting** 组件。这个属性是使用 **vote** action creator创建一个action
的函数，并且向Redux store分发action。因此，现在点击投票按钮将会分发一个事件！你应该可以立即在浏览器中看到效果：当
你作出投票后，按钮将会变得disabled。

<h3 id='Sending_Actions_To_The_Server_Using_Redux_Middleware'> 使用Redux中间件向服务端发送Actions</h3>

我们应用程序的最后一个方面是解决服务器如何获得用户操作结果的问题。这会发生在用户进行投票时，也会发生在投票发起者在
投票结果页面点击NEXT按钮时。

让我们开始讨论投票过程。下面是一个我们已经实现的清单：

* 当用户进行投票时，一个 **vote** action将会被创建并分发给客户端Redux store。
* **vote** actions将会被reducer处理并且设置 **hasVoted** state。
* 服务器端通过 **action** socket.io事件已经准备好接收来自客户端的actions。它将向服务器端Redux store分发所有已
接收到的actions。
* 服务端Redux store通过登记投票的方式来处理**vote** actions，并且会更新相应票数。

看起来我们几乎已经拥有了所需要的一切！唯独缺少的是将客户端的 **vote** actions发送给服务器端，这样它可以被分配到服务器端
和客户端两个Redux store。我们接下来就来完成它！

我们应该如何处理它呢？Redux没有为这个目的内置一些东西，因为像我们这样支持一个分布式系统实际上并不属于Redux的核心功能。
它让我们自己决定如何向服务器端发送客户端actions。

Redux提供了一种通用方式来访问被分发到Redux store的actions：[Middleware](http://redux.js.org/docs/advanced/Middleware.html)

Redux middleware是一个函数，它会在actions被分发的时候被调用，并且调用发生在reducer和store执行actions之前。middleware
可以做任何事情，从日志记录和异常处理到修改actions,缓存结果，甚至改变事件到达store的方式和时间。我们将要使用它来向服务器端
发送客户端actions。

---

注意Redux middleware和Redux listener的区别：Middleware在actions到达store之前被调用，它们可以影响actions的动作。Listener
是在action被分发之后才被调用，它实际上并不能改变actions。它们是为了不同目的的不同工具。

---

我们打算做的是创建一个"remote action middleware", 它可以使被分发的actions不仅可以到达原来的store, 也可以到达使用socket.io到达
远程的store.

我们先把middleware框架搭起来。它是一个函数，输入参数为Redux store,返回一个将"next"回调函数作为输入参数的函数2。函数2可以
返回第三个将Redux action作为输入参数的函数3。函数3将是middleware真正要实现的地方：
```js
// src/remote_action_middleware.js

export default store => next => action => {

}
```

上面的代码看起来有点不专业，但是实际上它不过是一种更简洁的表达方式：
```js
export default function(store) {
  return function(next) {
    return function(action) {

    }
  }
}
```

这种嵌套的单参数函数的形式被称为[currying](https://en.wikipedia.org/wiki/Currying)。在这种情况下使用它是为了让middleware
更容易配置。如果我们一个包含了所有参数的函数( **function(store, next, action) { }** )。我们必须在每次使用middlerware都要
提供所有参数。使用curry版本，我们可以调用最外层函数一次，并获得一个"记忆"使用哪个store的返回值。 **next**参数同样如此。

**next** 参数是middleware在完成其工作后调用的回调函数，并且action应该被发往store(或者下一个middleware)：
```js
// src/remote_action_middleware.js

export default store => next => action => {
  return next(action);
}
```

---

middleware也可以决定不调用 **next** , 如果它决定应该进行暂停操作。在这种情况下，它不会进入reducer或者store。

---

让我们在middleware中log一些东西，这样我们可以它被调用的时间：
```js
// src/remote_action_middleware.js

export default store => next => action => {
  console.log('in middleware', action);
  return next(action);
}
```

如果我们现在将middleware添加进Redux store, 我们应该可以看到所有的actions被logged。middleware可以使用Redux附带的 **applyMiddleware**
函数来启动。它接收我们需要注册的middleware, 并且返回一个接收 **createStore** 函数的函数。第二个函数将会为我们建立一个包含middleware
的store。
```js
// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import io from 'socket.io-client';
import reducer from './reducer';
import {setState} from './action_creators';
import remoteActionMiddleware from './remote_action_middleware';
import App from './components/App';
import {VotingContainer} from './components/Voting';
import {ResultsContainer} from './components/Results';

const createStoreWithMiddleware = applyMiddleware(
  remoteActionMiddleware
)(createStore);
const store = createStoreWithMiddleware(reducer);

const socket = io(`${location.protocol}//${location.hostname}:8090`);
socket.on('state', state =>
  store.dispatch(setState(state))
);

const routes = <Route component={App}>
  <Route path="/results" component={ResultsContainer} />
  <Route path="/" component={VotingContainer} />
</Route>;

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>{routes}</Router>
  </Provider>,
  document.getElementById('app')
);
```

---

我们刚才讨论的配置环节是另外一个使用curry风格的实例。Redux API使用它占了相当大的比重。

---

如果你现在重载app, 你将会看到middleware logging事件发生: 一个是初始化 **SET_STATE** action, 一个是 **VOTE**
action。

这个middleware实际上应该向Socket.io连接发送特定的action, 除了给它下一个中间件。(What this middleware should
actually do is send a given action to a Socket.io connection, in addition to giving it to the next
middleware.) 在它实现之前，需要连接来发送它。我们在 **index.jsx** 中已经有了一个连接——我们只需要middleware可以
访问到它。在中间件定义中使用curry很容易实现。最外层函数应该使用socket.io套接字：
```js

// src/remote_action_middleware.js

export default socket => store => next => action => {
  console.log('in middleware', action);
  return next(action);
}
```

现在我们可以从 **index.jsx** 传入套接字：
```js
// src/index.jsx

const socket = io(`${location.protocol}//${location.hostname}:8090`);
socket.on('state', state =>
  store.dispatch(setState(state))
);

const createStoreWithMiddleware = applyMiddleware(
  remoteActionMiddleware(socket)
)(createStore);
const store = createStoreWithMiddleware(reducer);
```

注意我们需要调换 **socket** 和 **store** 的初始化顺序，即先创建socket。我们在store的初始化过程中需要它。

现在剩下需要做的是从中间件发送一个 **action** :
```js
// src/remote_action_middleware.js

export default socket => store => next => action => {
  socket.emit('action', action);
  return next(action);
}
```

就是这样，如果你点击其中一个投票按钮，你会在同一浏览器窗口或者其他浏览器窗口中看到票数更新。投票正在注册！

关于现在的想法还有一个主要问题：当我们获得了来自服务器端更新的state并且分发了 **SET_STATE** action，它也直接
回到服务器端。服务器端的监听仍然被触发，将产生一个新的 **SET_STATE**。 我们进入了无限循环！这当然是非常糟糕的。

remote action middleware向服务器发送每个action是不合适的。有些action，比如说 **SET_STATE**, 应该只需要在
客户端本地处理。我们可以扩展middleware只向服务器端发送特定的action。具体的是，我们应该只发送带有 **{meta: {remote: true}}**
属性的action.

---

此模式是根据[middleware documentation](http://redux.js.org/docs/advanced/Middleware.html#seven-examples)
中的rafScheduler示例进行调整。
```js
// src/remote_action_middleware.js

export default socket => store => next => action => {
  if (action.meta && action.meta.remote) {
    socket.emit('action', action);
  }
  return next(action);
}
```

**Vote** 的action creator 应该设置这个属性, **SET_STATE** 则不设置这个属性:
```js
// src/action_creators.js

export function setState(state) {
  return {
    type: 'SET_STATE',
    state
  };
}

export function vote(entry) {
  return {
    meta: {remote: true},
    type: 'VOTE',
    entry
  };
}
```

现在我们来回顾一下刚才发生的事情：

* 用户点击投票按钮。**VOTE** action将会被分发。
* 在action进入reducer或者store前，先由remote action middleware通过Socket.io连接发送action.
* 客户端Rudex store接收了action,将本地 **hasVoted** 属性设置为true.
* 当消息发送到服务器端，服务器端Redux store接收并处理了action,更新了相应条目的投票数.
* 服务器端Redux store的监听器向所以已连接的客户端广播一个state快照。
* **SET_STATE** action被分发向所有已连接的客户端Redux store.
* 所有已连接的客户端Redux store使用来自服务器端更新后的state来处理 **SET_STATE** action.

为了完成我们的应用程序，我们只需要让NEXT按钮工作即可。和投票按钮一样，服务器端也已经有了相应的逻辑.我们只需要
把它们连起来。

**NEXT** action creator需要创建正确类型的远程操作：
```js
// src/action_creator.js

export function setState(state) {
  return {
    type: 'SET_STATE',
    state
  };
}

export function vote(entry) {
  return {
    meta: {remote: true},
    type: 'VOTE',
    entry
  };
}

export function next() {
  return {
    meta: {remote: true},
    type: 'NEXT'
  };
}
```

ResultsContainer组件应该将action creators作为属性连接起来。
```js
// src/components/Results.jsx

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import Winner from './Winner';
import * as actionCreators from '../action_creators';

export const Results = React.createClass({
  mixins: [PureRenderMixin],
  getPair: function() {
    return this.props.pair || [];
  },
  getVotes: function(entry) {
    if (this.props.tally && this.props.tally.has(entry)) {
      return this.props.tally.get(entry);
    }
    return 0;
  },
  render: function() {
    return this.props.winner ?
      <Winner ref="winner" winner={this.props.winner} /> :
      <div className="results">
        <div className="tally">
          {this.getPair().map(entry =>
            <div key={entry} className="entry">
              <h1>{entry}</h1>
              <div className="voteCount">
                {this.getVotes(entry)}
              </div>
            </div>
          )}
        </div>
        <div className="management">
          <button ref="next"
                   className="next"
                   onClick={this.props.next}>
            Next
          </button>
        </div>
      </div>;
  }
});

function mapStateToProps(state) {
  return {
    pair: state.getIn(['vote', 'pair']),
    tally: state.getIn(['vote', 'tally']),
    winner: state.get('winner')
  }
}

export const ResultsContainer = connect(
  mapStateToProps,
  actionCreators
)(Results);
```

啊...就是这样！我们现在有一个完整的、正常运行的应用程序。试着在你电脑上打开投票结果页面，在手机端打开投票
界面。你将会看到一个设备上的action将会立即影响另外一个设备。这是感觉神奇的一件事：在一个界面上进行投票，在
另外一个界面上看到投票结果更新。点击投票结果界面上的"NEXT"按钮，并且在投票设备上观察投票进展。为了使它更有
趣，下次与朋友一起的时候安排一次投票吧！

<h3 id='exercises'> 练习</h3>

如果你打算进一步开发这款app,同时可以进一步熟悉Redux architecture, 下面有一些练习。我已经贴上了每种练习的
一种可能答案。

<h4 id='Invilid_Vote_Prevention'>1. 预防无效投票</h3>
如果投票的条目不在当前的条目对中，服务器应该拒绝该条目作出投票。添加一个失败的单元测试并且修复相关逻辑。

下面是我编写的单元测试:
```js
// src/test/core_spec3.js

import {List, Map} from 'immutable';
import {expect} from 'chai';
import {vote} from '../src/core';

describe('application logic', () => {

  //..

  decribe('vote', () => {

    it('tally won`t be added when voted entry isn`t included in the current pair', () => {
      const state = Map({
          pair: List.of('Transplotting', '28 Days Later'),
          tally: Map({
              'Transplotting': 3,
              '28 Days Later': 2
          })
      });

      const nextState = vote(state, 'Sunshine');

      expect(nextState).to.equal(Map({
          pair: List.of('Transplotting', '28 Days Later'),
          tally: Map({
              'Transplotting': 3,
              '28 Days Later': 2
          })
      }));
    });

  });
});
```


这是我的解决方法:
```js
// src/core.js

export function vote(voteState, entry) {
    const currentPair = voteState.get('pair');
    if(currentPair.includes(entry)) {
        return voteState.updateIn(
            ['tally', entry],
            0,
            tally => tally+1
        );
    }
    return voteState;
}
```
在更新投票之前先判断currentPair中是否包含entry条目,如果包含的话再进行投票。

原作者的解决思路和我一致，如果您感兴趣的话可以点击[Original author solution](https://github.com/teropa/redux-voting-server/commit/exercise-1)

<h4 id='Improved_Vote_State_Reset'>2. 改进投票state重置</h3>

目前的客户端应用程序重置 **hasVoted** 属性是在新的投票对中不包含 **hasVoted** 属性指定的条目时。这会造成一个问题：
在投票的最后一个阶段，两个连续的条目对肯定包含相同的条目，这个时候 **hasVoted** 属性将不会被重置。用户在最后一轮不能
作出投票操作，因为两个投票按钮都处于disabled.

先说我的想法: 直接在客户端的 **resetVoted** 函数中添加逻辑判断是否当前state中的entries为空(如果为空，因为着这次投票
处于最后环节，此时同样remove **hasVoted** 属性),代码如下：
```js
// src/reducer.js

function resetVote(state) {
    const hasVoted = state.get('hasVoted');
    const currentPair = state.getIn(['vote', 'pair'], List());
    const currentEntries = state.get('entries',List());
    if(!currentEntries && currentEntries.isEmpty()) {
        return state.remove('hasVoted');
    } else if(hasVoted && !currentPair.includes(hasVoted)) {
        return state.remove('hasVoted');
    } else {
        return state;
    }
}
```

首先，这种想法经过测试后发现是错的。我只考虑了最后一轮环节的初始情况，却没有考虑到这种方法实际上又使disabled功能失效了
(因为vote action虽然set了hasVoted属性，但是action要发向server端的，server端dispatching Voting action后，通过
socket向客户端发送state,客户端接收到后，dispatching setState方法，这时remove hasVoted属性...)。其次，这种想法我本
人觉得这种做法非常愚蠢，因为它仅仅是为了处理一种特殊情况而增加新的逻辑判断，导致代码出现长串的if-else, 总感觉它不可扩展，
但是暂时又没有想到反例:(

---

**接下来让我们下看看原作者的想法:**

修改我们的系统使它在每轮投票中都创建一个unique identifier,并且投票状态通过追踪每轮的id进行更新。

提示：在服务器端跟踪一个运行的轮次计数器。当用户进行投票操作时，将当前轮数保存在客户端状态中。当状态更新时，如果轮次数
已改变，则重置 **hasVoted** 属性。


我们在服务器端state中添加一个round属性，每轮对应的round不同。我们先编写相关单元测试：
```js

// src/test/core_spec5.js

describe('next', () => {
    it('add unique identifier', () => {

        const state = fromJS({
            vote: {
                pair: ['Transplotting', '28 Days Later'],
                round: 1,
                tally: {
                    'Transplotting': 4,
                    '28 Days Later': 2
                }
            },
            entries: ['Sunshine', 'Millions', '127 Hours']
        });

        const nextState = next(state);
        expect(nextState).to.equal(fromJS({
            vote: {
                pair: ['Sunshine', 'Millions'],
                round: 2
            },
            entries: ['127 Hours', 'Transplotting']

        }));

    });
});
```

注意，由于我们添加了round属性，其他关于next函数的单元测试也需要同时修改：
```js

// src/test/core_spec1.js

describe('application logic', () => {

    //..

    describe('next', () => {

        it('take the next two entries under vote', () => {
            const state = Map({
                entries: List.of('Transpotting', '28 Days Later', 'Sunshine')
            });
            const nextState = next(state);
            expect(nextState).to.equal(Map({
                vote: Map({
                    pair: List.of('Transpotting', '28 Days Later'),
                    round: 1
                }),
                entries: List.of('Sunshine')
            }));
        });

    });

});
```

```js

// src/test/core_spec4.js


describe("application logic", () => {

    //..

   describe('winnerAndNext', () => {

       it('put winner of current vote back to entries', () => {
           const state = fromJS({
               vote: {
                   pair: ['Transplotting', '28 Days Later'],
                   tally: {
                       'Transplotting': 4,
                       '28 Days Later': 2
                   }
               },
               entries: ['Sunshine', 'Millions', '127 Hours']
           });

           const nextState = next(state);
           expect(nextState).to.equal(fromJS({
               vote: {
                   pair: ['Sunshine', 'Millions'],
                   round: 1
               },
               entries: ['127 Hours', 'Transplotting']
           }));
       });

       it('puts both from tied vote back to entries', () => {
           const state = Map({
               vote: Map({
                   pair: List.of('Trainspotting', '28 Days Later'),
                   tally: Map({
                       'Trainspotting': 3,
                       '28 Days Later': 3
                   })
               }),
               entries: List.of('Sunshine', 'Millions', '127 Hours')
           });
           const nextState = next(state);
           expect(nextState).to.equal(Map({
               vote: Map({
                   pair: List.of('Sunshine', 'Millions'),
                   round: 1
               }),
               entries: List.of('127 Hours', 'Trainspotting', '28 Days Later')
           }));
       });
   });
});
```

```js

// src/test/reducer_spec.js

describe('reducer', ()=> {
    it('handle NEXT', () => {
        const initialState = fromJS({
            entries: ['Transplotting', '28 Days Later'],

        });
        const action = {type: 'NEXT'};
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            vote:{
                pair: ['Transplotting', '28 Days Later'],
                round: 1
            },
            entries: []
        }));
    });
});
```


接下来我们修改服务器端 **next** 函数，在 **vote** 属性中添加了 **round** 属性。
```js

// src/core.js

export function next(state) {
    const entries = state.get('entries')
        .concat(getWinners(state.get('vote')));
    if (entries.size === 1) {
        return state.remove('vote')
            .remove('entries')
            .set('winner', entries.first());
    } else {
        return state.merge({
            vote: Map(
                {pair: entries.take(2),
                 round: state.getIn(['vote', 'round'], 0) + 1
                }),
            entries: entries.skip(2)
        });
    }
}
```

然后我们对客户端进行修改。在这里，我修改了 **setState** 函数，它通过比对oldState和newState来判断
时候去除 **hasVoted** 属性。
```js
// src/components/reducer.js

function setState(state, newState) {
    let mergedState = state.merge(newState);
    const oldRound = state.getIn(['vote', 'round']);
    const newRound = fromJS(newState).getIn(['vote', 'round']);
    console.log(oldRound);
    console.log(newRound);
    if( mergedState.get('hasVoted') && oldRound !== newRound ) {
        return mergedState.remove('hasVoted');
    } else {
        return mergedState;
    }
}
```

##### 注意：原作者的客户端程序写法与我的不同，你应该去理解下[原作者的写法](https://github.com/teropa/redux-voting-client/commit/exercise-2)

<h4 id='Duplicate_Vote_Prevention'>3. 预防重复投票</h3>

如果一个用户只刷新页面，则用户仍然可以在同一轮中投票多次，因为他们投票的状态丢失了。请你解决这个问题.

提示：为每个用户生成唯一的标识符，并在服务器上追踪谁投票了什么内容。这样如果用户再次投票，他们对该轮投票的之前投票
将被取消。如果这么做，你也可以跳过禁用投票按钮，因为用户可能在轮次间改变主意。

为了给每个用户生成唯一的标识符，我们在客户端安装uuid package:
```sh
npm install --save uuid
```

在每个客户端初始化后，我们为它设置唯一的标识符:
```js
// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {VotingContainer} from './components/Voting';
import {ResultsContainer} from './components/Results';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import {Router, Route, browserHistory} from 'react-router';
import io from 'socket.io-client';
import {setState, setClientId} from './action_creators';
import getClientId from './client_id';
import remoteActionMiddleware from './remote_action_middleware';

const socket = io(`${location.protocol}//${location.hostname}:8090`);
socket.on('state', state =>
    store.dispatch(setState(state))
);

const createStoreWithMiddleware = applyMiddleware(
    remoteActionMiddleware(socket)
)(createStore);
const store = createStoreWithMiddleware(reducer);
store.dispatch(setClientId(getClientId()));



const appInstance = (
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route  component={App}>
            <Route path="/" component={VotingContainer}/>
            <Route path="/results" component={ResultsContainer}/>
        </Route>
      </Router>
    </Provider>
    );

ReactDOM.render(
    appInstance,
    document.getElementById('app')
);
```

其中 setClientId 为action。所以我们要修改action_creators.js:
```js

// src/action_creator.js

 //..
export function setClientId(clientId) {
    return {
        type: 'SET_CLIENT_ID',
        clientId
    }
}
```

接下来，我们要完成获得客户端唯一标识符的部分，我们将uuid存放在localStorage中，每当客户端进行连接时读取
localStorage获得clientId。创建一个名为 **client_id.js** 的文件:
```js

//src/client_id.js

/**
 * Created on 17/12/2016.
 */

import uuid from 'uuid';

export default function getClientId() {
    let id = localStorage.getItem('clientId');
    if(!id) {
        id = uuid.v4();
        localStorage.setItem('clientId', id);
    }
    return id;
}
```

我们现在有了 **setClientId** action, 接下来就是修改我们的reducer:
```js

//scr/reducer.js

export default function reducer(state = Map(), action) {

    switch (action.type) {
        case 'SET_STATE' :
            return resetVote(setState(state, action.state));
        case 'VOTE' :
            return vote(state, action.entry);
        case 'SET_CLIENT_ID' :
            return state.set('clientId', action.clientId);
    }

    return state;
}
```

最后，别忘了修改 **remote_action_middleware**, 在每次向服务器端发送action时插入clientId:
```js

// src/remote_action_middleware.js

export default socket => store => next => action => {
    if(action.meta && action.meta.remote) {
        const clientId = store.getState().get('clientId');
        socket.emit('action',Object.assign({}, action, {clientId}));
    }
    return next(action);
}
```

完成了客户端代码修改，我们将目光转移到服务器端。在服务器端我们只需要关注 **vote** action的处理过程,我们
先去除该clientId之前的投票信息, 然后再进行重新计票。
```js

// src/reducer.js

import {setEntries, next, vote, INITIAL_STATE} from './core'

export default function reducer(state = INITIAL_STATE, action) {
    //figure out which function to call and call it
    switch (action.type) {
        case 'SET_ENTRIES':
            return setEntries(state, action.entries);
        case 'NEXT':
            return next(state);
        case 'VOTE':
            return state.update('vote',
                                 voteState => vote(voteState, action.entry, action.clientId));
    }
    return state;
}
```

```js

// src/core.js

//..

function removePreviousVote(voteState, voter) {
    const previousVote = voteState.getIn(['voters', voter]);
    if(previousVote) {
        return voteState.updateIn(['tally', previousVote], tally => tally-1)
                        .removeIn(['voters',voter]);
    }
    return voteState;
}

function addVote(voteState, entry, voter) {
    const currentPair = voteState.get('pair', List());
    if(currentPair.includes(entry) && voter ) {
        return voteState.updateIn(['tally', entry], 0, tally => tally+1)
                        .setIn(['voters', voter], entry)
    }
    return voteState;
}

export function vote(voteState, entry, voter) {
    return addVote(
        removePreviousVote(voteState, voter),
        entry,
        voter
    )
}
```

最后, 别忘记了修改相关的单元测试代码哦！


<h4 id='Restarting_The_Vote'>4. 重新开始投票</h3>

在结果页面实现一个按钮允许用户从头开始投票。

提示: 你需要track状态中的原始条目，并将他们重置回去。

我们着眼于客户端代码的修改，先在action_creator.js中添加生成reset action的相关代码。
```js
// src/action_creator.js

function reset() {
    return {
        meta: {remote: true},
        type: 'RESET'
    };
}
```

我们还要在result界面中添加reset按钮，并且保持onClick事件为reset.
```js
// src/component/Result.jsx

export class Results extends React.PureComponent {
    constructor(props) {
        super(props);
        this.getPair = this.getPair.bind(this);
        this.getVotes = this.getVotes.bind(this);
    }

    getPair() {
        return this.props.pair || [];
    }

    getVotes(entry) {
        if(this.props.tally && this.props.tally.has(entry)) {
            return this.props.tally.get(entry);
        }
        return 0;
    }

    render() {
        return (
            this.props.winner ?
            <Winner ref="winner" winner = {this.props.winner} /> :
            <div className="results">
                {this.getPair().map( (entry, index) =>
                    <div key={index} className="entry">
                        <h1>{entry}</h1>
                        <div className="voteCount">
                            {this.getVotes(entry)}
                        </div>
                    </div>
                )}
                <div className="management">
                    <button ref="next"
                            className="next"
                            onClick={this.props.next}>
                        Next
                    </button>
                    <button
                            className="reset"
                            onClick={this.props.reset}>
                        Reset
                    </button>
                </div>
            </div>
        );
    }
}
```

接下来我们开始考虑服务器端的部分，我们在state中添加了一项originalEntries,一旦reset action被分发，
服务器端将state重置为originalEntries。注意重置完成后，我们要手动调用一次next action,再次将state
回到初始状态。
```js
// src/core.js

export function setEntries(state, entries) {
    return state.set('entries', List(entries))
                .set('originalEntries', List(entries));
}

export function next(state) {
    const entries = state.get('entries')
        .concat(getWinners(state.get('vote')));
    if (entries.size === 1) {
        return state.remove('vote')
            .remove('entries')
            .remove('originalEntries')
            .set('winner', entries.first());
    } else {
        return state.merge({
            vote: Map(
                {pair: entries.take(2),
                 round: state.getIn(['vote', 'round'], 0) + 1
                }),
            entries: entries.skip(2)
        });
    }
}

export function reset(state) {
    const originalEntries = state.get('originalEntries');
    return Map({
        'entries': originalEntries,
        'originalEntries': originalEntries
    });
}
```
我们要在setEntries方法中添加设置originalEntries的动作，同时在next方法中，若entries.size === 1
我们还要移除掉'originalEntries' state, 在reset方法中，我们使用originalEntries将state重置。

接下来，我们要修改reducer.js, 添加处理RESET action的情况。
```js
// src/reducer.js

import {setEntries, next, vote, reset, INITIAL_STATE} from './core'

export default function reducer(state = INITIAL_STATE, action) {
    //figure out which function to call and call it
    switch (action.type) {
        case 'SET_ENTRIES':
            return setEntries(state, action.entries);
        case 'NEXT':
            return next(state);
        case 'VOTE':
            return state.update('vote',
                                 voteState => vote(voteState, action.entry, action.clientId));
        case 'RESET':
            const originalState = reset(state);
            return next(originalState);

    }
    return state;
}
```

最后，别忘了修改关于reducer和core的相关单元测试代码！

<h4 id='Indicating_Socket_Connection_State'>5. 指示套接字连接state</h3>

当连接不稳定时，Socket.io可能不会总是立即相连接。我们需要添加可视指示器来通知用户为连接。
<h4 id='Bouns_Challenge_Going_Peer_To_Peer'>6. 加分挑战：Going Peer To Peer</h3>
