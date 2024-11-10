# yjs

## 基本数据类型

- YArray、
- YMap
- YText 

## 基本事件

基本调用顺序
- beforeTransaction
- beforeObserverCalls
- afterTransaction
- ytype.observe(event => { .. }) 
- update:  

## 通信 y-websocket 



## helloworld

```ts
import * as Y from 'yjs';

function onSync(doc1: Y.Doc, doc2: Y.Doc) {
    console.log('\n同步前的两个文档');
    console.log('doc1:', doc1.getArray('shared_array').toArray());
    console.log('doc2:', doc2.getArray('shared_array').toArray());

    // 将 doc1 的状态转换为更新，并应用于 doc2
    console.log("将 doc1 的状态转换为更新")
    const update1 = Y.encodeStateAsUpdate(doc1);
    console.log("将更新应用到doc2中")
    Y.applyUpdate(doc2, update1);

    // 将 doc2 的状态转换为更新，并应用于 doc1
    console.log("将 doc2 的状态转换为更新")
    const update2 = Y.encodeStateAsUpdate(doc2);
    console.log("将更新应用到doc1中")
    Y.applyUpdate(doc1, update2);

    // 检查同步后两个文档的状态
    console.log('\n同步后的两个文档');
    console.log('doc1:', doc1.getArray('shared_array').toArray());
    console.log('doc2:', doc2.getArray('shared_array').toArray());
}

// 创建两个 Yjs 文档 (doc1 和 doc2)
const doc1 = new Y.Doc();
const sharedArray1 = doc1.getArray('shared_array');
sharedArray1.insert(0, ['A']);
const doc2 = new Y.Doc();
const sharedArray2 = doc2.getArray('shared_array');
sharedArray2.insert(0, ['B']);
// 将两个文档同步前的状态打印
onSync(doc1, doc2);
// 添加新元素到 doc1
sharedArray1.insert(1, ['C']);
// 为了模拟并发更新，同时将新元素添加到 doc2
sharedArray2.insert(1, ['D']);

sharedArray1.observe(event => {
    // Log a delta every time the type changes
    // Learn more about the delta format here: https://quilljs.com/docs/delta/
    console.log('sharedArray1变化:', event.changes.delta)
})
sharedArray2.observe(event => {
    // Log a delta every time the type changes
    // Learn more about the delta format here: https://quilljs.com/docs/delta/
    console.log('sharedArray2变化:', event.changes.delta)
})

doc1.on("update", (update: Uint8Array, origin: any, doc: Y.Doc, trans: Y.Transaction) => {
    //decodeUpdate会解析更新的数据成一个JSON数据,里面包含structs和ds两个key
    //structs
    const decodeInfo = Y.decodeUpdate(update);
    console.log("doc1变化")
    console.log("structs", decodeInfo.structs);
    console.log("DeleteSet", decodeInfo.ds);
})
// 将两个文档的并发更改同步并打印状态
onSync(doc1, doc2);



```