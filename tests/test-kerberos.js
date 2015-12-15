'use strict'

var http = require('http')
var kerberos = require('kerberos')
var request = require('../')
var tape = require('tape')
var server = http.createServer()
var k = new kerberos.Kerberos()
var context = null


tape('setup', function (t) {
  server.listen(3000, function () {
    k.authGSSServerInit('HTTP@localhost', function (err, _context) {
      t.equal(err, null)
      context = _context
      t.end()
    })
  })
})

tape('kerberos', function (t) {
  server.on('request', function (req, res) {
    var authData = req.headers.authorization.replace('Negotiate ', '')
    k.authGSSServerStep(context, authData, function (err) {
      if (err) console.log(err)
      res.end('success')
    })
  })

  request.get('http://localhost:3000', {
    auth: {negotiate: true}
  }, function (err, res, body) {
    t.equal(err, null)
    t.equal(body, 'success')
    t.end()
  })
})

tape('cleanup', function (t) {
  k.authGSSServerClean(context, function (err) {
    t.equal(err, null)
    server.close(function () {
      t.end()
    })
  })
})
