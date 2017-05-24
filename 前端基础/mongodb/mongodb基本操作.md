## mongodb特点
* 开源
* 文档型
* noSQL

 |mysql | mongodb|
|-------|------- |
|   db|   db| 
|   table|   collection| 
|   record|   document| 
|   field|   field| 

文档型中的**文档**是指bson。bson是json的超集，比如json无法存储二进制类型，bson扩展了类型，提供了二进制支持。

sql中的record对应着mongodb中的document。但是record是一维的，document可以嵌套很多层。比如存储一个文章的tags, mongodb中的字段可以轻松存储数据类型，sql需要设计一对多表关系。

```js
var post = {
  title: '哈哈',
  author: 'stormqx',
  tags: ['tag1', 'tag2']
};
```

### Auto-Sharding
sharding的意思可以理解为scale sql时的分表。 
TODO

mongodb没有表链接，无法支持事务。所以在使用mongodb前要考虑这两点。

### collection: schema-less
mongodb中，collection是schema-less的。同一个collection中，可以有些document具有100个字段，有些具有5个字段。有个比较典型的场景是用来存储日志类型的数据。

### mongodb CRUD
CRUD(create, read, update, delete)

#### create opreation

* `db.collection.insertOne()`
* `db.collection.insertMany()`

```
db.users.insertOne(          <----- collection
  {
    name: "sue",             <----- field: value  
    age: 26,                 <----- field: value
    status: "pending"        <----- field: value
  }
)
```

**Unordered Inserts**:

```
try {
  db.products.insertMany([
     { _id: 10, item: "large box", qty: 20 },
     { _id: 11, item: "small box", qty: 55 },
     { _id: 11, item: "medium box", qty: 30 },
     { _id: 12, item: "envelope", qty: 100}
  ], { oredered: false });
} catch(e) {
  print(e);
}
```
上面代码试图插入多个文档，设置了`ordered: false`，其中两个document有相同的**_id**字段。

#### read opreation

* `db.collection.find()`

```
db.users.find(                <----- collection
  { age: { $gt: 18 } },       <----- query criteria
  { name: 1, address: 1}      <----- projection
).limit(5)                    <----- cursor modifier
```

| 转义 |字符 |
| ---| ---|
| $gt | > |
| &gte| >=|
| $lt| <  |
| $lte| <=|
| $ne | != |

or查询(`$in` 和 `$or`)是尽可能的获取更多的匹配项。

#### update operation

* `db.collection.updateOne()`
* `db.collection.updateMany()`
* `db.collection.replaceOne()`

```
db.users.updateMany(                <----- collection
  { age: { $lt: 18 } },             <----- update filter
  { $set: { status: "reject" } }    <----- update action
)
```

#### delete operation

* `db.collection.deleteOne()`
* `db.collection.deleteMany()`

```
db.users.deleteMany(                <----- collection
  { status: "reject" }              <----- delete filter
)
```
