require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = (process.env.NODE_ENV === 'testing' || process.env.NODE_ENV === 'production') ?
  require('./webpack.prod.conf') :
  require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable
/**************服务端配置开始****************/

//让服务端支持ES6/ES7/ES8
require("babel-core/register")({
  presets: ['es2015', 'stage-0']
})
require("babel-polyfill")

//服务端入口文件
var app = require('../server')
/**************服务端配置结束****************/

var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({
      action: 'reload'
    })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = {
      target: options
    }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
var fallback = require('connect-history-api-fallback')

if (process.env.NODE_ENV === 'testing' || process.env.NODE_ENV === 'production') {
  app.get(['/app', /^\/app\/.*$/], function (req, res) {
    res.sendFile(path.resolve('dist/index.html'))
  })
  app.use(fallback())
  app.use('/static', express.static('./dist/static'))
} else {
  app.use(fallback({
    rewrites: [{
      from: /^\/app$/,
      to: '/app/index.html'
    }, {
      from: /^\/app\/.*$/,
      to: function (context) {
        var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory) + '/'
        if (!context.parsedUrl.pathname.indexOf(staticPath) || context.parsedUrl.pathname.slice(-7) === '/app.js') {
          return context.parsedUrl.pathname
        } else {
          return '/app/index.html'
        }
      }
    }]
  }))

  // serve webpack bundle output
  app.use(devMiddleware)
  // enable hot-reload and state-preserving
  // compilation error display
  app.use(hotMiddleware)
}

app.use('/static', express.static('./static'))

var uri = 'http://localhost:' + 3000

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

// var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {}
}