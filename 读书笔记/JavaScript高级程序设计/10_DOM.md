## DOM
dom( document object model )是针对HTML文档的一个API。DOM描绘了一个层次化的结构树，允许开发人员CRUD页面的某一部分。

DOM定义了一个`Node`接口，该接口由DOM中所有节点类型实现。

每个节点有`childNodes`属性，保存着一个NodeList对象。

element元素有一个`children`，它返回所有element元素的子节点。

属性：

```js
parentNode
firstChild
lastChild
nextSibling
previousSibling
hasChildNodes()
```

### 操作节点

```js
appendChild()
insertBefore(要插入的节点， 作为参照的节点)
appendChild() 效果与 insertBefore(null)相同
replaceChild(要插入的节点， 要替换的节点)
removeChild()
```
