const SpankApp = require('./app')

function SpankAppBuilder() {
  this.routesByPattern = {}
  this.routes = []
  this.mounts = []
}

SpankAppBuilder.prototype.get = function (pattern, route) {
  this.findOrCreateRouteForPattern(pattern).route.GET = route
}

SpankAppBuilder.prototype.findOrCreateRouteForPattern = function (pattern) {
  var routeEntry = this.routesByPattern[pattern]
  if (!routeEntry) {
    routeEntry = this.routesByPattern[pattern] = { pattern, route: {} }
    this.routes.push(routeEntry)
  }
  return routeEntry
}

SpankAppBuilder.prototype.use = function (path, builder) {
  this.mounts.push({ path, builder })
}

SpankAppBuilder.prototype.build = function() {
  var finalRoutes = Object.assign(this.routes, [])
  for (var i = 0; i < this.mounts.length; i++) {
    var mount = this.mounts[i]
    for (var j = 0; j < mount.builder.routes.length; j++) {
      var mountedRouteEntry = Object.assign(mount.builder.routes[i], {})
      mountedRouteEntry.pattern = mount.path + mountedRouteEntry.pattern
      finalRoutes.push(mountedRouteEntry)
    }
  }
  return new SpankApp(finalRoutes)
}

module.exports = SpankAppBuilder
