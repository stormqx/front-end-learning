> 该component lifecycle基于react router v3。不一定符合react router v4.

# 学习动机
在编写[redux-blog](https://github.com/stormqx/redux-blog)项目的时候，分页url是:

```
// 首页
http://localhost:3009

//第n页内容
http://localhost:3009/?page=n
```

由于现在还没有使用SSR(其实使用SSR不是重点，SSR只保证了首屏显示这种情况，如果点击`LeftNav`的*首页标签*，还是会存在上面两种路由渲染同一个组件的情况), 这里就涉及到**异步数据获取应该放在哪里。**

## 1. flux
在类flux架构下，常见的异步数据获取方法在组件的`componentDidMount`中执行。例如:

```js
class BlogPost extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      blogPost: DataSource.getBlogPost(props.id)
    };
  }

  componentDidMount() {
    DataSource.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    DataSource.removeChangeListener(this.handleChange);
  }

  handleChange() {
    this.setState({
      blogPost: DataSource.getBlogPost(this.props.id)
    });
  }

  render() {
    return <TextBlock text={this.state.blogPost} />;
  }
}
```

这样在组件加载的时候即可进行异步操作获取数据。但是这种方法并不适合redux-blog项目的场景。这是因为分页过后，跳转不同页面仍然在同一个组件中进行，这里的`componentDidMount`只会在初始化的时候执行，这种做法导致跳转页面不会刷新数据。

## 2.dva
最近看了下alipay的dva框架，感觉封装框架的人都好牛逼！dva框架将alipay使用react的最佳实践进行封装，下面提供了一些相关资料：

* [dva 介绍](https://github.com/dvajs/dva/issues/1)
* [React + Redux 最佳实践](https://github.com/sorrycc/blog/issues/1)
* [初识 Dva](https://github.com/pigcan/blog/issues/2)

我们看看dva是如何解决这种场景的:

```js
import * as usersService from '../services/users';

export default {
  namespace: 'users',
  state: {
    list: [],
    total: null,
  },
  reducers: {
    save(state, { payload: { data: list, total } }) {
      return { ...state, list, total };
    },
  },
  effects: {
    *fetch({ payload: { page } }, { call, put }) {
      const { data, headers } = yield call(usersService.fetch, { page });
      yield put({ type: 'save', payload: { data, total: headers['x-total-count'] } });
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/users') {
          dispatch({ type: 'fetch', payload: query });
        }
      });
    },
  },
};
```

dva在`subscriptions`(参考Elm概念)中监听了history, 在进入`/users`路由时disaptch **fetch action**。这种做法很爽，直接在入口处理query，不用考虑各种情况下访问`/users(:search)`组件的内部执行流程。

由于没有使用dva这种框架，只能另寻他路。到目前为止(2017-05-12)，处理这种场景的方法是利用组件的内部生命周期实现。

# 理解route component调用的lifecycle hooks

假如路由配置如下:

```js
<Route path='/' component={App}>
  <IndexRoute component={Home}/>
  <Route path='invoices/:invoiceId' component={Invoice}/>
  <Route path='accounts/:accountId' component={Account}/>
</Route>
```

## 路由跳转的lifecycle hook

1.当用户在App中进入`/`:

| component | lifecycle hook called |
| --------- | --------------------- |
|  App      | (2) `componentDidMount` |
|  Home     | (1) `componentDidMount` |
|  Invoice  |   N/A                 |
|  Account  |   N/A                 |

2.从`/`跳转到`/invoices/123`:

| component | lifecycle hook called |
| --------- | --------------------- |
|  App      | (1) `componentWillReceiveProps` (4) `componentDidUpdate` |
|  Home     | (2) `componentWillUnmount` |
|  Invoice  | (3) `componentDidMount`   |
|  Account  |   N/A                 |

* `App`执行`componentWillReceiveProps`和`componentDidUpdate`是因为它仍然被渲染只是接受了从router接受了新的props(比如 `children`, `params`, `location`等等)
* `Home`不再渲染，所以执行`componentWillUnmount`.
* `Invoice`首先被挂载，执行`componentDidMount`.

3.从`/invoices/123`到`/invoices/789`:

| component | lifecycle hook called |
| --------- | --------------------- |
|  App      | (1) `componentWillReceiveProps` (4) `componentDidUpdate` |
|  Home     |  N/A                  |
|  Invoice  | (2) `componentWillReceiveProps` (3) `componentDidUpdate`|
|  Account  |   N/A                 |

* 所有的组件之前已经挂载，它们只会从router中接受新的props.

4.从`/invoices/789`到`/accounts/123`:

| component | lifecycle hook called |
| --------- | --------------------- |
|  App      | (1) `componentWillReceiveProps` (4) `componentDidUpdate` |
|  Home     |  N/A                  |
|  Invoice  | (2) `componentWillUnmount` |
|  Account  | (3) `componentDidMount` |

## Fetching data

明白了上面的lifecycle后，我们知道在跳转过程中，与具体某个组件息息相关的生命周期函数是`componentDidMount`和`componentDidUpdate`.

```js
export default class Invoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invoice: null,
    };
  } 
  
  componentDidMount() {
    // fetch data initially in scenario 2 from above
    this.fetchInvoice();
  }
  
  componentDidUpdate(prevProps) {
    // respond to parameter change in scenario 3.
    const oldId = prevProps.params.invoiceId;
    const newId = this.props.params.invoiceId;
    if(oldId !== newId) {
      this.fetchInvoice();
    }
  }
  
   componentWillUnmount () {
    // allows us to ignore an inflight request in scenario 4
    this.ignoreLastFetch = true
  },

  
  fetchInvoice() {
    const url = `/api/invoices/${this.props.params.invoiceId}`
    this.request = fetch(url, (err, data) => {
      if(!this.ignoreLastFetch)
        this.setState({ invoice: data.invoice })
    })
  }
  
  render() {
    return <InvoiceView invoice={this.state.invoice}/>
  }
}
```

## Q&A
### 为什么不在`Invoice`的`componentWillReceiveProps`中进行数据异步请求？

这是因为`componentWillReceiveProps`, `shouldComponentUpdate`, `componentWillUpdate`生命周期函数都是在`render`函数前调用，如果在`componentWillReceiveProps `获取数据,将导致:

`componentWillReceiveProps ` --> `setState()` -> `componentWillReceiveProps`的循环调用。这也是react文档中说明的，不要在`componentWillReceiveProps`, `shouldComponentUpdate`, `componentWillUpdate`调用`setState`方法的原因。

TODO: 抽空了解下dva的subcriptions实现 `history.listen`方法，确实很优雅，不用考虑组件生命周期细节。
