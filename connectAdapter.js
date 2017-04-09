function ConnectAdapter() {}

ConnectAdapter.prototype.connectify = function(spankApp) {
  return (request, response) => {
    const spankRequest = { method: request.method, url: request.url }
    const spankResponse = spankApp.respond(spankRequest)
    if (spankResponse) {
      response.writeHead(spankResponse.status, spankResponse.headers)
      response.end(spankResponse.body)
    }
  }
}

module.exports = ConnectAdapter
