const routism = require('routism')
const parseURL = require('url').parse
const querystring = require('querystring')

function SpankApp(routes) {
  this.router = routism.compile(routes)
}

SpankApp.prototype.respond = function (request) {
  const url = parseURL(request.url)
  const requestParams = this.paramsFromUrl(url)
  const recognition = this.router.recognise(url.pathname)
  if (recognition) {
    const method = recognition.route[request.method.toLowerCase()]
    if (method) {
      const params = recognition.params.reduce((params, pair) => {
        params[pair[0]] = pair[1]; return params
      }, requestParams)
      const result = method({ params })
      if (typeof result === 'string') {
        return {
          status: 200,
          body: result,
          headers: { 'content-type': 'text/plain' }
        }
      }
    }
  }
  return { status: 404 }
}

SpankApp.prototype.paramsFromUrl = function (url) {
  return url.query ? querystring.parse(url.query) : {}
}

module.exports = SpankApp
