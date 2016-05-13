# x-ray-http-cache

  http-cache driver for [x-ray](https://github.com/lapwinglabs/x-ray).

  Uses [superagent-cache](https://github.com/jpodwys/superagent-cache) for caching.

  See it's documentation for supported caching drivers.

## Installation

```
npm install x-ray-http-cache --save
```

## Usage

```js
var httpCache = require('x-ray-http-cache');

// using redis for caching
var redisModule = require('cache-service-redis');

var redisCache = new redisModule({
  redisUrl: 'http://localhost:6379'
});

var options = {
   driver: httpCache({
      driver: redisCache,
      cacheWhenEmpty: false,
      expiration: 86400 // 24 hours
   })
}

var Xray = require('x-ray');

var x = Xray()
  .driver(httpCache({
     driver: redisCache
  }));

x('http://google.com', 'title')(function(err, str) {
  if (err) return done(err);
  assert.equal('Google', str);
  done();
})
```

## Throttle

It's currently not possible to determine whether or not to throttle based on cache.

However if you are sure the cache is already populated you can reset throttling using:
```javascript
x.throttle(Infinity, 0);
```

## License

MIT
