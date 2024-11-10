const Y = require('y-websocket');

// const http = require('http');
// const pingTimeout = 30000;
// const port = process.env.PORT || 4445;

// const ydoc = new Y.Doc();
// const ymap = ydoc.getMap('topics');

// const server = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'text/plain' });
//     response.end('okay');
// });

const doc = new Y.Doc();
const yarray = doc.getArray('my-array')
yarray.observe(event => {
  console.log('yarray 被修改了')
})
// 每当本地或远程客户端修改 yarray 时，观察者都会被调用
yarray.insert(0, ['val']) // => "yarray 被修改了"
