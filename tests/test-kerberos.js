'use strict'

var http = require('http')
var kerberos = require('kerberos')
var request = require('../')
var tape = require('tape')

var k = new kerberos.Kerberos()
var server = http.createServer()

tape('setup', function (t) {
  server.listen(6767, t.end.bind())
  server.on('request', function (req, res) {
    if (!req.headers.authorization) {
      res.writeHead(401, {'WWW-Authenticate': 'Negotiate something'})
      res.end()
    }
    else {
      var host = req.headers.host.replace(/:\d+/, '')
      k.authGSSServerInit('HTTP@' + host, function (err, context) {
        t.equal(err, null, 'err')
        var authData = req.headers.authorization.replace('Negotiate ', '')
        k.authGSSServerStep(context, authData, function (err) {
          t.equal(err, null, 'err')
          k.authGSSServerClean(context, function (err) {
            t.equal(err, null, 'err')
            res.end('success')
          })
        })
      })
    }
  })
})

tape('sendImmediately true', function (t) {
  request.get('http://localhost:6767', {
    auth: {negotiate: true, sendImmediately: true}
  }, function (err, res, body) {
    t.equal(err, null, 'err')
    t.equal(body, 'success', 'body')
    t.end()
  })
})

tape('sendImmediately false', function (t) {
  request.get('http://localhost:6767', {
    auth: {negotiate: true, sendImmediately: false}
  }, function (err, res, body) {
    t.equal(err, null, 'err')
    t.equal(body, 'success', 'body')
    t.end()
  })
})

tape('cleanup', function (t) {
  server.close(t.end.bind())
})
