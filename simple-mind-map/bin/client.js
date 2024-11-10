import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as ws from "ws";
// 设置全局 WebSocket
globalThis.WebSocket = ws.WebSocket;

// Connect it to the backend
const ydoc = new Y.Doc()
const provider = new HocuspocusProvider({
    url: "ws://127.0.0.1:9504/internal-apis/v1/hocuspocus", // Replace with your Hocuspocus Server URL
    //   url: "ws://127.0.0.1:9504/internal-apis/v1/whiteboards",
    name: "681448907427143681", // Replace with your document ID
    token: "eyJhbGciOiJIUzI1NiIsInR5cGUiOiJKV1QifQ==.eyJpc3MiOjUyNjcyNzc1MjM3ODY3OTI5NiwiZXhwIjoxNzEwMjMwNDA5LCJzdWIiOiJKc29uIFdlYiBUb2tlbiIsImF1ZCI6bnVsbCwibmJmIjpudWxsLCJpYXQiOjE3MDk2MjU2MDksImp0aSI6NjIzNTQ4NzYwMjAwMTcxNTIxLCJjdXMiOnsiZGV2aWNlX2lkIjoiMTBmMmU4MjY3Y2NjMzQ3ZDljYjA4Y2QwMmRmYjM1ZWY2NTM3Njg1NTcwMDM5MzQzZjg4OGExMjM5NGY2MThjMiJ9fQ==.fb26ab25e41a5db55871515ddcb4f5d5ec7fac72fa4ce431213e5549a2919b31",
    document: ydoc,
    parameters: {'organization-code': 'DT001'}
});

// Define `tasks` as an Array
const data = provider.document.getArray("data");
const meta = provider.document.getMap("meta")
const awareness = provider.awareness
awareness.setLocalStateField('user', {
    // Define a print name that should be displayed
    name: 'Emmanuelle Charpentier',
    // Define a color that should be associated to the user:
    color: '#ffb61e' // should be a hex color
})

awareness.on('update', () => {
    // console.log('awareness: ', awareness.getStates())
})

// Listen for changes
data.observe(() => {
    console.log("data were modified:", data.toJSON());
});
meta.observe(() => {
    console.log("meta were modified:", meta.toJSON());
});

provider.on('message', event => {
    // console.log(event)
})

provider.onClose(event => {
    // console.log(event)
})

// data.push(['aaa'])
var tempYArray = new Y.Array()
tempYArray.push(['aaa'])
tempYArray.push(['bbb'])
meta.set('test2', tempYArray)
const tempYArray2 = meta.get('test2')
tempYArray2.push(['ccc'])
console.log(tempYArray.toJSON())