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

  var agent = superagent.agent(opts || {})

  /* eslint-disable camelcase */
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
