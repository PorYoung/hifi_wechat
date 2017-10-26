const opn = require('opn')
const express = require('express')
/**************服务端配置开始****************/

//让服务端支持ES6/ES7/ES8
require("babel-core/register")({
  presets: ['es2015']
})
require("babel-polyfill")

//服务端入口文件
const app = require('../server')
/**************服务端配置结束****************/
app.use('/static', express.static('./static'))

const uri = 'http://localhost:' + 3000

opn(uri)