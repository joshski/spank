function ConnectAdapter() {}

ConnectAdapter.prototype.connectify = function(spankApp) {
  return function(request, response) {
    const spankResponse = spankApp.respond(request.url, request.method)
    if (spankResponse) {
      response.writeHead(spankResponse.status, spankResponse.headers)
      response.end(spankResponse.body)
    }
  }
}

module.exports = ConnectAdapter
