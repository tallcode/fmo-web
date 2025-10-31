import { WebSocket, WebSocketServer } from 'ws'

const REMOTE_URL = 'ws://192.168.0.47/audio'
const RECONNECT_DELAY = 5000 // 5 seconds

/**
 * Creates a WebSocket proxy for audio streaming.
 * It connects to a remote WebSocket and broadcasts received messages to all local clients.
 * @param {import('http').Server | import('https').Server} server The HTTP/S server instance.
 */
export function createAudioProxy(server) {
  const wss = new WebSocketServer({ noServer: true })
  const clients = new Set()

  // Handle WebSocket upgrade requests for the /audio path
  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/audio') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
      })
    }
  })

  // Manage local client connections
  wss.on('connection', (ws) => {
    clients.add(ws)
    ws.on('close', () => {
      clients.delete(ws)
    })
    // Per requirement, messages from local clients are ignored.
    ws.on('message', () => {})
  })

  /**
   * Broadcasts a message to all connected local clients.
   * @param {Buffer} data The message data to broadcast.
   */
  function broadcast(data) {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }

  /**
   * Connects to the remote WebSocket and handles message forwarding and reconnection.
   */
  function connectRemote() {
    const remoteWs = new WebSocket(REMOTE_URL)

    remoteWs.on('open', () => {
      // eslint-disable-next-line no-console
      console.log(`Connected to remote audio source: ${REMOTE_URL}`)
    })

    remoteWs.on('message', (data) => {
      broadcast(data)
    })

    remoteWs.on('error', (err) => {
      console.error(`Error with remote audio source: ${err.message}`)
      // The 'close' event will be fired, triggering reconnection logic.
    })

    remoteWs.on('close', () => {
      // eslint-disable-next-line no-console
      console.log(`Disconnected from remote audio source. Reconnecting in ${RECONNECT_DELAY / 1000}s...`)
      setTimeout(connectRemote, RECONNECT_DELAY)
    })
  }

  // Initial connection attempt
  connectRemote()
}
