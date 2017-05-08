const assert = require('assert')
const httpism = require('httpism')
const connect = require('connect')
const express = require('express')

const SpankAppBuilder = require('../builder')
const ConnectAdapter = require('../connectAdapter')

const spank = () => new SpankAppBuilder()

describeApps(
  'GET / => 200 hello world',
  {
    express: [
      app => {
        app.get('/', function (req, res) {
          res.send('hello world')
        })
      }
    ],
    spank: [
      app => {
        app.get('/', () => 'hello world')
      }
    ]
  },
  client => client.get('/', { response: true }),
  it => it('responds with 200', response => {
    assert.equal(response.statusCode, 200)
  }),
  it => it('responds with hello world', response => {
    assert.equal(response.body, 'hello world')
  })
)

describeApps(
  'GET /hello/:param => 200 hello world',
  {
    express: [
      app => {
        app.get('/hello/:param', function (req, res) {
          res.send('hello ' + req.params.param)
        })
      }
    ],
    spank: [
      app => {
        app.get('/hello/:param', req => 'hello ' + req.params.param)
      }
    ]
  },
  client => client.get('/hello/world', { response: true }),
  it => it('responds with 200', response => {
    assert.equal(response.statusCode, 200)
  }),
  it => it('responds with hello world', response => {
    assert.equal(response.body, 'hello world')
  })
)

describeApps(
  'GET /hello?param=world => 200 hello world',
  {
    express: [
      app => {
        app.get('/hello', function (req, res) {
          res.send('hello ' + req.query.param)
        })
      }
    ],
    spank: [
      app => {
        app.get('/hello', ({ params }) => 'hello ' + params.param)
      }
    ]
  },
  client => client.get('/hello?param=world', { response: true }),
  it => it('responds with 200', response => {
    assert.equal(response.statusCode, 200)
  }),
  it => it('responds with hello world', response => {
    assert.equal(response.body, 'hello world')
  })
)

describeApps(
  'GET /hello?p=1&p=2 => 200 hello ["1","2"]',
  {
    express: [
      app => {
        app.get('/hello', function (req, res) {
          res.send('hello ' + JSON.stringify(req.query.p))
        })
      }
    ],
    spank: [
      app => {
        app.get('/hello', ({ params }) => 'hello ' + JSON.stringify(params.p))
      }
    ]
  },
  client => client.get('/hello?p=1&p=2', { response: true }),
  it => it('responds with 200', response => {
    assert.equal(response.statusCode, 200)
  }),
  it => it('responds with hello ["1","2"]', response => {
    assert.equal(response.body, 'hello ["1","2"]')
  })
)

describeApps(
  'GET /say?p=hello+world => 200 hello world',
  {
    express: [
      app => {
        app.get('/say', function (req, res) {
          res.send(req.query.p)
        })
      }
    ],
    spank: [
      app => {
        app.get('/say', ({ params }) => params.p)
      }
    ]
  },
  client => client.get('/say?p=hello+world', { response: true }),
  it => it('responds with 200', response => {
    assert.equal(response.statusCode, 200)
  }),
  it => it('responds with hello world', response => {
    assert.equal(response.body, 'hello world')
  })
)

describeApps(
  'GET /hello%20world => 200 hello world',
  {
    express: [
      app => {
        app.get('/:param', function (req, res) {
          res.send(req.params.param)
        })
      }
    ],
    spank: [
      app => {
        app.get('/:param', ({ params }) => params.param)
      }
    ]
  },
  client => client.get('/hello%20world', { response: true }),
  it => it('responds with 200', response => {
    assert.equal(response.statusCode, 200)
  }),
  it => it('responds with hello world', response => {
    assert.equal(response.body, 'hello world')
  })
)

describeApps(
  'GET /delay/1 => 200 hello world (after 1ms)',
  {
    express: [
      app => {
        app.get('/delay/1', function (req, res) {
          setTimeout(function () {
            res.send('hello world')
          }, 1)
        })
      }
    ],
    spank: [
      app => {
        app.get('/delay/1', () => new Promise(function(resolve) {
          setTimeout(() => resolve('hello world'), 1)
        }))
      }
    ]
  },
  client => client.get('/delay/1', { response: true }),
  it => it('responds with 200', response => {
    assert.equal(response.statusCode, 200)
  }),
  it => it('responds with hello world', response => {
    assert.equal(response.body, 'hello world')
  })
)

describeApps(
  'GET /json => 200 { "hello": "world" }',
  {
    express: [
      app => {
        app.get('/json', function (req, res) {
          res.json({ hello: 'world' })
        })
      }
    ],
    spank: [
      app => {
        app.get('/json', () => ({ hello: 'world' }))
      }
    ]
  },
  client => client.get('/json', { response: true }),
  it => it('responds with 200', response => {
    assert.equal(response.statusCode, 200)
  }),
  it => it('responds with hello world', response => {
    assert.deepEqual(response.body, { hello: 'world' })
  })
)

describeApps(
  'GET /admin/hello/world => 200 hello world',
  {
    express: [
      app => {
        const admin = express()
        admin.get('/hello/world', (req, res) => res.send('hello world'))
        app.use('/admin', admin)
      },
      app => {
        const admin = express()
        app.use('/admin', admin)
        admin.get('/hello/world', (req, res) => res.send('hello world'))
      }
    ],
    spank: [
      app => {
        const admin = spank()
        admin.get('/hello/world', () => 'hello world')
        app.use('/admin', admin)
      },
      app => {
        const admin = spank()
        app.use('/admin', admin)
        admin.get('/hello/world', () => 'hello world')
      }
    ]
  },
  client => client.get('/admin/hello/world', { response: true }),
  it => it('responds with 200', response => {
    assert.equal(response.statusCode, 200)
  }),
  it => it('responds with hello world', response => {
    assert.deepEqual(response.body, 'hello world')
  })
)

class SpankClient {
  constructor(app) {
    this.app = app
  }

  get(url) {
    const request = {
      method: 'GET',
      url: url
    }
    return this.app.respond(request).then(response => {
      if (response.headers['content-type'] == 'application/json') {
        response.body = JSON.parse(response.body)
      }
      return response
    })
  }
}

let port = 4100

function describeApps(name, apps, sendRequest) {
  const specs = [].slice.call(arguments, 3).map(spec => {
    const mapped = {}
    const it = (name, handler) => {
      mapped.name = name
      mapped.handler = handler
    }
    spec(it)
    return mapped
  })

  describeAppsWithSpecs(name, apps, specs, sendRequest)
}

function describeAppsWithSpecs(name, apps, specs, sendRequest) {
  function runSpecs() {
    specs.forEach(spec => {
      it(spec.name, function () {
        return sendRequest(this.client)
          .then(response => {
            return spec.handler(response)
          })
      })
    })
  }

  describe(name, function() {
    describe('express', function () {
      apps.express.forEach(expressAppSpec => {
        beforeEach(function (listening) {
          const app = express()
          expressAppSpec(app)
          this.port = ++port
          this.client = httpism.client(`http://localhost:${this.port}`)
          app.listen(this.port, function (err) {
            listening(err)
          })
        })
        runSpecs()
      })
    })

    describe('spank (connect)', function () {
      apps.spank.forEach(spankAppSpec => {
        beforeEach(function (listening) {
          const connectApp = connect()
          const spankAppBuilder = spank()
          spankAppSpec(spankAppBuilder)
          const spankApp = spankAppBuilder.build()
          const adapter = new ConnectAdapter()
          connectApp.use(adapter.connectify(spankApp))
          this.port = ++port
          this.client = httpism.client(`http://localhost:${this.port}`)
          connectApp.listen(this.port, function (err) {
            listening(err)
          })
        })
        runSpecs()
      })
    })

    describe('spank (direct)', function () {
      apps.spank.forEach(spankAppSpec => {
        beforeEach(function () {
          const spankAppBuilder = spank()
          spankAppSpec(spankAppBuilder)
          const spankApp = spankAppBuilder.build()
          this.client = new SpankClient(spankApp)
        })
        runSpecs()
      })
    })
  })
}
