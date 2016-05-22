const test = require('tape')
const httpCache = require('./../');
const redisModule = require('cache-service-redis');
const Xray = require('x-ray');
const http = require('http');
const assert = require('assert');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end('<html><title>TEST OK</title><body></body></html>');
});

server.listen(8000)

test('cache with redis', function (t) {
  t.plan(1);

  const redisCache = new redisModule({
    redisUrl: 'http://localhost:6379'
  });

  const x = Xray()
    .driver(httpCache({
      driver: redisCache,
      cacheWhenEmpty: false,
      expiration: 86400 // 24 hours
    }));

  x('http://localhost:8000', 'title')(function(err, str) {
    t.equal(str, 'TEST OK');

    // close connection to redis when finished
    redisCache.db.quit();

    server.close();
  });
});

