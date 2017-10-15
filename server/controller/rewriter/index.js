'use strict';
var url = require('url');

exports = module.exports = function historyApiFallback(options) {
  options = options || {};
  var logger = getLogger(options);

  return function (req, res, next) {
    var headers = req.headers;
    if (req.method !== 'GET') {
      return next();
    } else if (!headers || typeof headers.accept !== 'string') {
      return next();
    } else if (!headers.accept.indexOf('application/json')) {
      return next();
    } else if (!acceptsHtml(headers.accept, options)) {
      return next();
    }
    var parsedUrl = url.parse(req.url);
    var rewriteTarget;
    if (!isUndef(options.rewrites) && !isArray(options.rewrites)) {
      throw new Error('Rewrites must be an Array.');
    }
    options.rewrites = options.rewrites || [];
    for (var i = 0; i < options.rewrites.length; i++) {
      var rewrite = options.rewrites[i];
      var match;
      //if rewrite from is an array
      if (isArray(rewrite.from)) {
        for (var j = 0; j < rewrite.from.length; j++) {
          var rewriteFrom = rewrite.from[j];
          if (isString(rewriteFrom)) {
            if (rewriteFrom === parsedUrl.pathname) {
              match = rewriteFrom;
              break;
            }
          } else if (isRegExp(rewriteFrom)) {
            if (rewriteFrom.test(parsedUrl.pathname)) {
              match = parsedUrl.pathname.match(rewriteFrom);
              break;
            }
          } else {
            throw new Error('Rewrite from must be a String or RegExp.');
          }
        }
        //rewrite from is single
      } else {
        if (isString(rewrite.from)) {
          rewrite.from === parsedUrl.pathname && (match = rewrite.from);
        } else if (isRegExp(rewrite.from)) {
          rewrite.from.test(parsedUrl.pathname) && (match = parsedUrl.pathname.match(rewrite.from));
        } else {
          throw new Error('Rewrite from must be a String or RegExp.');
        }
      }
      //exclude conditions
      if (isArray(rewrite.exclude)) {
        for (var k = 0; k < rewrite.exclude.length; k++) {
          var rewriteExclude = rewrite.exclude[k];
          if (isString(rewriteExclude) && rewriteExclude === match) {
            return next();
          } else if (isRegExp(rewriteExclude) && rewriteExclude.test(match)) {
            return next();
          }
        }
        //exclude condition is single
      } else {
        if (isString(rewrite.exclude) && rewrite.exclude === match) {
          return next();
        } else if (isRegExp(rewrite.exclude) && rewrite.exclude.test(match)) {
          return next();
        }
      }
      //if match
      if (!isUndef(match)) {
        rewriteTarget = rewriteRules(parsedUrl, match, rewrite.to);
        logger('Rewriting', req.method, req.url, 'to', rewriteTarget);
        req.url = rewriteTarget;
        return next();
      }
    }
    if (options.index) {
      rewriteTarget = options.index;
      logger('Rewriting', req.method, req.url, 'to', rewriteTarget);
      req.url = rewriteTarget;
    }

    return next();
  };
};

var _toString = Object.prototype.toString;

function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]'
}

function isString(v) {
  return _toString.call(v) === '[object String]'
}

function isArray(v) {
  return Array.isArray(v)
}

function isUndef(v) {
  return v === undefined || v === null
}

function acceptsHtml(header, options) {
  options.htmlAcceptHeaders = options.htmlAcceptHeaders || ['text/html', '*/*'];
  for (var i = 0; i < options.htmlAcceptHeaders.length; i++) {
    if (header.indexOf(options.htmlAcceptHeaders[i]) !== -1) {
      return true;
    }
  }
  return false;
}

function rewriteRules(parsedUrl, match, rule) {
  if (isString(rule)) {
    return rule;
  } else if (typeof rule !== 'function') {
    throw new Error('Rewrite rule can only be a type of string or function.');
  }
  return rule({
    parsedUrl: parsedUrl,
    match: match
  });
}

function getLogger(options) {
  if (typeof options.log === 'function') {
    return options.log;
  } else if (options.log === true) {
    return console.log;
  }
  return function () {};
}