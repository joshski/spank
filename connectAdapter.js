function ConnectAdapter() {}

ConnectAdapter.prototype.connectify = function(spankApp) {
  return (request, response) => {
    const spankRequest = { method: request.method, url: request.url }
    spankApp.respond(spankRequest)
      .then(function (r) {
        response.writeHead(r.status, r.headers)
        response.end(r.body)
      })
  }
}

module.exports = ConnectAdapter
