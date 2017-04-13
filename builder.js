const SpankApp = require('./app')

function SpankAppBuilder() {
  this.routingsByPattern = {}
  this.routings = []
  this.mounts = []
}

SpankAppBuilder.prototype.get = function (pattern, route) {
  this.findOrCreateRoutingForPattern(pattern).route.GET = route
}

SpankAppBuilder.prototype.findOrCreateRoutingForPattern = function (pattern) {
  var routing = this.routingsByPattern[pattern]
  if (!routing) {
    routing = this.routingsByPattern[pattern] = { pattern, route: {} }
    this.routings.push(routing)
  }
  return routing
}

SpankAppBuilder.prototype.use = function (path, builder) {
  this.mounts.push({ path, builder })
}

SpankAppBuilder.prototype.build = function() {
  var finalRoutings = Object.assign(this.routings, [])
  for (var i = 0; i < this.mounts.length; i++) {
    var mount = this.mounts[i]
    for (var j = 0; j < mount.builder.routings.length; j++) {
      var mountedRouting = Object.assign(mount.builder.routings[i], {})
      mountedRouting.pattern = mount.path + mountedRouting.pattern
      finalRoutings.push(mountedRouting)
    }
  }
  return new SpankApp(finalRoutings)
}

module.exports = SpankAppBuilder
