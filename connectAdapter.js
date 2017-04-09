function ConnectAdapter() {}

ConnectAdapter.prototype.connectify = function(spankApp) {
  return (request, response) => {
    const spankRequest = { method: request.method, url: request.url }
    const spankResponse = spankApp.respond(spankRequest)
    if (typeof spankResponse.then === 'function') {
      spankResponse
        .then(function (r) {
          response.writeHead(r.status, r.headers)
          response.end(r.body)
        })
    } else {
      response.writeHead(spankResponse.status, spankResponse.headers)
      response.end(spankResponse.body)
    }
  }
}

module.exports = ConnectAdapter
