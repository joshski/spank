const assert = require('assert')
const httpism = require('httpism')
const connect = require('connect')
const express = require('express')

const SpankAppBuilder = require('../builder')
const ConnectAdapter = require('../connectAdapter')

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
    beforeEach(function() {
      this.port = ++port
      this.client = httpism.client(`http://localhost:${this.port}`)
    })

    describe('express', function () {
      apps.express.forEach(expressAppSpec => {
        beforeEach(function (listening) {
          const app = express()
          expressAppSpec(app)
          app.listen(this.port, function (err) {
            listening(err)
          })
        })
      })

      runSpecs()
    })

    describe('spank', function () {
      apps.spank.forEach(spankAppSpec => {
        beforeEach(function (listening) {
          const connectApp = connect()
          const spankAppBuilder = new SpankAppBuilder()
          spankAppSpec(spankAppBuilder)
          const spankApp = spankAppBuilder.build()
          const adapter = new ConnectAdapter()
          connectApp.use(adapter.connectify(spankApp))
          connectApp.listen(this.port, function (err) {
            listening(err)
          })
        })
      })

      runSpecs()
    })
  })
}
