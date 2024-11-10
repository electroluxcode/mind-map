#!/usr/bin/env node

import ws from 'ws'
import http from 'http'

// 处理映射数据结构 y-ws 这是这样做的
import * as map from 'lib0/map'

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1


// 基本原理是将思维导图的树数据转成平级的对象数据
// 然后通过Y.Map类型的共享数据进行协同，即当画布上进行了某些操作后会更新y.map对象，
// 然后其他协同的客户端会接收到更新后的数据，再转换回树结构数据，更新画布即可实现实时更新。

const pingTimeout = 30000

console.log('ws server start')
const port = process.env.PORT || 4444
// @ts-ignore
const wss = new ws.Server({ noServer: true })

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

/**
 * Map froms topic-name to set of subscribed clients.
 * @type {Map<string, Set<any>>}
 */
const topics = new Map()

/**
 * @param {any} conn
 * @param {object} message
 */
const send = (conn, message) => {
  // console.log('send-----------', message)
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    conn.close()
  }
  try {
    conn.send(JSON.stringify(message))
  } catch (e) {
    conn.close()
  }
}

/**
 * Setup a new client
 * @param {any} conn
 */
const onconnection = conn => {
  /**
   * @type {Set<string>}
   */
  // console.log('new client connected')
  const subscribedTopics = new Set()
  let closed = false
  // Check if connection is still alive
  let pongReceived = true
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      conn.close()
      clearInterval(pingInterval)
    } else {
      pongReceived = false
      try {
        conn.ping()
      } catch (e) {
        conn.close()
      }
    }
  }, pingTimeout)
  conn.on('pong', () => {
    pongReceived = true
  })
  conn.on('close', () => {
    subscribedTopics.forEach(topicName => {
      const subs = topics.get(topicName) || new Set()
      subs.delete(conn)
      if (subs.size === 0) {
        topics.delete(topicName)
      }
    })
    subscribedTopics.clear()
    closed = true
  })
  conn.on(
    'message',
    /** @param {object} message */ message => {
      // console.log("收到信息----------")
      // console.log(message)
      if (typeof message === 'string') {
        message = JSON.parse(message)
      }
      // console.log('收到信息------------')
      // console.log(message)
      if (message && message.type && !closed) {
        switch (message.type) {
          // step1: 开始订阅
          case 'subscribe':
            /** @type {Array<string>} */ ;(message.topics || []).forEach(
              topicName => {
                if (typeof topicName === 'string') {
                  // add conn to topic
                  // step 1.1 获取现有连接数据,如果没有就新建一个
                  // 用 topicName 来命名
                  const topic = map.setIfUndefined(
                    topics,
                    topicName,
                    () => new Set()
                  )
                  topic.add(conn)
                  // add topic to conn
                  subscribedTopics.add(topicName)
                }
              }
            )
            break
          case 'unsubscribe':
            /** @type {Array<string>} */ 
            (message.topics || []).forEach(
              topicName => {
                const subs = topics.get(topicName)
                if (subs) {
                  subs.delete(conn)
                }
              }
            )
            break
          case 'publish':
            if (message.topic) {
              const receivers = topics.get(message.topic)
              if (receivers) {
                message.clients = receivers.size
                receivers.forEach(receiver => send(receiver, message))
              }
            }
            break
          case 'ping':
            send(conn, { type: 'pong' })
        }
      }
    }
  )
}
wss.on('connection', onconnection)

server.on('upgrade', (request, socket, head) => {
  // You may check auth of request here..
  /**
   * @param {any} ws
   */
  const handleAuth = ws => {
    wss.emit('connection', ws, request)
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

server.listen(port)

console.log('Signaling server running on localhost:', port)
