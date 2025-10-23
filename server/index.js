import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import process from 'node:process'
import compression from 'compression'
import express from 'express'
import * as emqx from './emqx.js'
import 'dotenv/config'

const SECURE = process.env.SECURE === 'TRUE'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const app = express()
app.disable('x-powered-by')
app.use(compression())
app.get('/api/client', async (req, res) => {
  const clients = await emqx.clients()
  res.json(clients)
})
app.get('/api/count', async (req, res) => {
  const count = await emqx.count()
  res.json({ count })
})
app.use(express.static('dist'))
app.use((req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')))

const server = SECURE
  ? https.createServer({
      key: fs.readFileSync(path.join(__dirname, `cert/145.1mhz.cn.key`)),
      cert: fs.readFileSync(path.join(__dirname, `cert/145.1mhz.cn.pem`)),
    }, app)
  : http.createServer(app)

const port = SECURE ? 8043 : 8080
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on port ${port}`)
})

if (SECURE) {
  http.createServer((req, res) => {
    res.writeHead(301, {
      Location: `https://${req.headers.host}${req.url}`,
    })
    res.end()
  }).listen(8080, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is listening on port 8080`)
  })
}
