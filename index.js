var superagent = require('superagent')
var superagentCache = require('superagent-cache')

module.exports = driver

/**
 * Caching HTTP driver
 *
 * @param {Object} opts
 * @return {Function}
 */

function driver (options) {
  var opts = options || {}

  if (opts) {
    if (opts.driver) {
      superagentCache(superagent, opts.driver, opts)
    } else {
      superagentCache(superagent)
    }
  }

  var agent = superagent.agent(opts || {})

  return function http_cache_driver (ctx, fn) {
    agent
      .get(ctx.url)
      .set(ctx.headers)
      .end(function (err, res) {
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
      })
  }
}
