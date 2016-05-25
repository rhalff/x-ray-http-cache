var superagentCache = require('superagent-cache')
var superagentProxy = require('superagent-proxy')

module.exports = xRayHttpCacheDriver

/**
 * Caching HTTP driver
 *
 * @param {Object} options
 * @return {Function}
 */

function xRayHttpCacheDriver (options) {
  var opts = options || {}
  var args = []
  var superagent

  if (opts) {
    if (opts.superagent) {
      superagent = opts.superagent
    }

    args.push(superagent || null)

    if (opts.driver) {
      args.push(opts.driver, opts)
    }
  }

  var newAgent = superagentCache.apply(superagentCache, args)

  if (newAgent) {
    superagent = newAgent
  }

  if (opts.proxy) {
    superagentProxy(superagent)
  }

  var agent = superagent.agent(opts || {})

  /* eslint-disable camelcase */
  return function http_cache_driver (ctx, fn) {
    if (opts.proxy) {
      agent
        .get(ctx.url)
        .proxy(opts.proxy)
        .set(ctx.headers)
        .end(onresponse)
    } else {
      agent
        .get(ctx.url)
        .set(ctx.headers)
        .end(onresponse)
    }

    function onresponse (err, res) {
      if (err && !err.status) return fn(err)

      ctx.status = res.status
      ctx.set(res.headers)

      ctx.body = ctx.type === 'application/json'
        ? res.body
        : res.text

      // update the URL if there were redirects
      if (res.redirects) {
        ctx.url = res.redirects.length
          ? res.redirects.pop()
          : ctx.url
      }

      return fn(null, ctx)
    }
  }
}
