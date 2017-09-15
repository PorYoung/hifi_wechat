#!/usr/bin/env node

/**
 * Module dependencies.
 */
require("babel-core/register")({
  presets: ['es2015', 'stage-0']
})
require("babel-polyfill")

var app = require('../app')
/**
 * app路由补充
 */
