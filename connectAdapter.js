const { parse } = require('url')

function ConnectAdapter() {}

ConnectAdapter.prototype.connectify = function(spankApp) {
  return (request, response) => {
    const url = parse(request.url)
    const params = this.paramsFromUrl(url)
    const spankRequest = { method: request.method, path: url.pathname, params }
    const spankResponse = spankApp.respond(spankRequest)
    if (spankResponse) {
      response.writeHead(spankResponse.status, spankResponse.headers)
      response.end(spankResponse.body)
    }
  }
}

ConnectAdapter.prototype.paramsFromUrl = function (url) {
  return url.query ? url.query.split('&').reduce((p, pair) => {
    const kv = pair.split('=')
    p[kv[0]] = kv[1]
    return p
  }, {}) : {}
}

module.exports = ConnectAdapter
