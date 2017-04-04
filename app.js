const routism = require('routism')

function SpankApp(routes) {
  this.router = routism.compile(routes)
}

SpankApp.prototype.respond = function (request) {
  const recognition = this.router.recognise(request.path)
  if (recognition) {
    const method = recognition.route[request.method.toLowerCase()]
    if (method) {
      const params = recognition.params.reduce((params, pair) => {
        params[pair[0]] = pair[1]; return params
      }, request.params)
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

module.exports = SpankApp
