const SpankApp = require('./app')

function SpankAppBuilder() {
  this.handlersByPattern = {}
  this.handlers = []
}

SpankAppBuilder.prototype.get = function(pattern, handler) {
  let patternHandler = this.handlersByPattern[pattern]
  if (!patternHandler) {
    patternHandler = this.handlersByPattern[pattern] = {
      pattern,
      route: {}
    }
    this.handlers.push(patternHandler)
  }
  patternHandler.route.get = handler
}

SpankAppBuilder.prototype.build = function() {
  return new SpankApp(this.handlers)
}

module.exports = SpankAppBuilder
