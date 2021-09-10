# idb

> Date: 2021-09-08
> Author: luo

基于 IndexedDB 的二次封装，以便客户端本地快捷操作数据库。

本封装使用 **函数式编程** 范式，共提供以下 API。
支持链式调用，每次调用都需 exec 执行。

支持对 IndexedDB 的批量增删改查。

|  API   | 解释  |
|  ----  | ----  |
| open   | 打开/新建 数据库 |
| table  | 连接/新建 表 |
| add    | 对 表 进行新增操作|
| put    | 对 表 进行更新操作|
| delete | 对 表 进行删除操作|
| get    | 对 表 进行查询操作|
| getAll | 查询当前 表 的所有数据|
| clear  | 清空当前 表 的所有数据|
| exec    | 执行当前命令栈所有命令|

## API

### open
打开数据库，若 name 不存在，则新建数据库。

|  params| type | require | 说明 |
|  ----  |----  |  ----   | ---- |
| name | String |true | 数据库名 |
| version | Number |true | 数据库版本 |

version 在对 数据库 新增 表时候，需要更新。


```js
open(name: String, version: Number)

const idb = new Idb()

idb.open('parent', 1).exec()
```

### table
打开指定表，若 name 不存在，则新建该表。

|  params| type | require | 说明 |
|  ----  |----  |  ----   | ---- |
| name | String |true | 表名 |
| primaryKey | String | false | 主键/索引 |

primaryKey: 新增时若不设置主键，将默认设置为 { autoIncrement: true }。

建议手动指定主键，否则主键将会默认从 1 开始递增。

对表进行的 add/put/delete/get 操作都将会依靠 主键 来完成。


```js
table(name: String, options: Object)

const idb = new Idb()

idb.table('parent', 'id').exec()
```

### add
对指定表进行 新增/批量新增 操作。

|  params| type | require | 说明 |
|  ----  |----  |  ----   | ---- |
| data | Any or Array/Object | true | 表名 |

若 table 时传入了指定主键，则新增的数据必须包含主键属性。此时数据结构为 Object/Object[]。

若 table 时未指定主键，则新增数据类型 any。


```js
const idb = new Idb()

idb.add({id: 1, text: 'hello'}).exec()

idb.add([
  {id: 1, text: 'hello'},
  {id: 2, text: 'world'}
]).exec()

```


add 在主键重复时，将会抛出错误。因此建议使用 put 进行新增数据，除非明确要新增的数据在表中已有的数据中不存在。

### put
对指定表进行 修改/批量修改 操作。

|  params| type | require | 说明 |
|  ----  |----  |  ----   | ---- |
| data | Any or Array/Object | true | 要修改的新数据 |


```js
const idb = new Idb()

idb.put({id: 1, text: 'hello'}).exec()

idb.put([
  {id: 1, text: 'hello'},
  {id: 2, text: 'world'}
]).exec()

```


若 table 时传入了指定主键，则修改的数据必须包含主键属性。此时数据结构为 Object/Object[]。

若修改的主键不存在，则新增该数据。

若 table 时未指定主键，则新增数据类型 any。

### delete
对指定表进行 删除/批量删除 操作。

|  params| type | require | 说明 |
|  ----  |----  |  ----   | ---- |
| data | primaryKey or primaryKey[] | true | 主键/主键组成的数组 |


```js
const idb = new Idb()

idb.delete(1).exec()

idb.delete([1, 2, 3]).exec()
```
传入单个 主键或主键组成的数组 皆可。

### get
对指定表进行 查询/批量查询 操作。

|  params| type | require | 说明 |
|  ----  |----  |  ----   | ---- |
| data | primaryKey or primaryKey[] | true | 主键/主键组成的数组 |


```js
const idb = new Idb()

idb.get(1).exec()

idb.get([1, 2, 3]).exec()
```

传入单个 主键或主键组成的数组 皆可。

### getAll
对指定表进行 查询全部数据 操作。

|  params| type | require | 说明 |
|  ----  |----  |  ----   | ---- |
| - | - | - | - |


```js
const idb = new Idb()

idb.getAll().exec()
```

### clear
对指定表进行 清空所有数据 的操作

|  params| type | require | 说明 |
|  ----  |----  |  ----   | ---- |
| - | - | - | - |


```js
const idb = new Idb()

// ...something idb 内部已关联了某个库表

idb.clear().exec()
```


### exec
执行该次链式调用的所有命令。

|  params| type | require | 说明 |
|  ----  |----  |  ----   | ---- |
| callback(result) | Function | false | 链式调用执行结束后的回调函数 |
| abnormalCb(error) | Function | false | 链式调用执行异常中断后的回调函数 |

callback(result): 链式调用执行结束后的回调函数，本次链式调用最后一个节点的结果将会传入 result。

abnormalCb(error): 链式调用执行异常后的回调函数，本次链式调用异常中断前的最后一个节点的结果将会传入 error。


```js
const idb = new Idb()

idb.xxx().exec(
  result => {},
  error => {}
)
```


所有的命令操作，都需要调用 exec 方能执行。

## Example

### 初始化


```js
const idb = new Idb()

// 若数据库不存在，则为 新建 idb 数据库，新增一张 table-1 表，设置主键为 id。
// 若数据库存在，table-1 亦存在，则为 打开 idb 数据库，实例内部关联该表。
idb.open('idb', 1).table('table-1', 'id').exec()

// 上文的操作 + 对 table-1 表新增了若干数据
idb
  .open('idb', 1)
  .table('table-1', 'id')
  .add([{id: 1, text: 'hello'}, {id: 2, text: 'world'}])
  .exec()

// 上文的操作 + 对 table-1 表新增了若干数据 + 修改了主键 id 为 1 的数据

idb
  .open('idb', 1)
  .table('table-1', 'id')
  .add([{id: 1, text: 'hello'}, {id: 2, text: 'world'}])
  .put({id: 1, text: 'newhello'})
  .exec()

```


每次对表进行操作时，无需重复 open + table。

在初始化 open + table 时，内部已关联了此实例操作的数据库 + 表。

只要确保在后续的操作时，实例内部已经关联即可。



```js
const idb = new Idb()

idb.open('idb', 1).table('table-1', 'id').exec(() => {
  idb.delete(1).exec()
})
```


当然，也可以重新执行 open + table 以更新实例内部的关联 库 + 表


```js
const idb = new Idb()

// 实例内部关联了 idb 数据库, table-1 表
idb.open('idb', 1).table('table-1', 'id').exec()

// 实例内部重新关联了 idb-2 数据库, table-2 表
idb.open('idb-2', 1).table('table-2', 'id').exec()
```
open 与 table 并非一定要在一起执行，单独执行亦可。

由于对库表的操作都属于异步行为，因此若要确保拿到最新状态的实例。可以这样执行。


```js
const idb = new Idb()

// 不建议进行如下操作
// 以下操作可能会出现操作冲突
// 因为无法确保在进行 add 操作时，open table 都已被执行完毕。
idb.open('idb', 1).table('table-1', 'id').exec()
idb.add([{id: 1, text: 'hello'}, {id: 2, text: 'world'}]).exec()

// 可以这样操作
idb.open('idb', 1).table('table-1', 'id').exec(() => {
  idb
    .add([{id: 1, text: 'hello'}, {id: 2, text: 'world'}])
    .exec()
})

// 亦可这样操作
idb
  .open('idb', 1)
  .table('table-1', 'id')
  .add([{id: 1, text: 'hello'}, {id: 2, text: 'world'}])
  .exec()
```
