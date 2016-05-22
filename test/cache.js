const test = require('tape')
const httpCache = require('./../')
const NodeCacheModule = require('cache-service-node-cache')
const Xray = require('x-ray')
const http = require('http')
const superagent = require('superagent')

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  })
  res.end('<html><title>TEST OK</title><body></body></html>')
})

const nodeCache = new NodeCacheModule({
  redisUrl: 'http://localhost:6379'
})

server.listen(8000)

const performTest = (t, superagent) => {
  nodeCache.flush(() => {
    const x = Xray()
      .driver(httpCache({
        driver: nodeCache,
        superagent: superagent || false,
        cacheWhenEmpty: false,
        defaultExpiration: 60
      }))

    x('http://localhost:8000', 'title')((err, str) => {
      if (err) {
        throw (err)
      }

      t.equal(str, 'TEST OK')
    })
  })
}

test('cache with node cache', (t) => {
  t.plan(1)

  performTest(t)
})

test('cache with node cache using own superagent', (t) => {
  t.plan(1)

  performTest(t, superagent)
})

test.onFinish(() => {
  nodeCache.db.close()
  server.close()
})

