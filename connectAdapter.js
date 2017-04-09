const { parse } = require('url')
const querystring = require('querystring')

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
  return url.query ? querystring.parse(url.query) : {}
}

module.exports = ConnectAdapter
