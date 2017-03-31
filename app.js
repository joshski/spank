const routism = require('routism')

function SpankApp(routes) {
  this.router = routism.compile(routes)
}

SpankApp.prototype.respond = function (url, methodName) {
  const recognition = this.router.recognise(url)
  if (recognition) {
    const method = recognition.route[methodName.toLowerCase()]
    if (method) {
      const params = recognition.params.reduce((params, pair) => {
        params[pair[0]] = pair[1]; return params
      }, {})
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
