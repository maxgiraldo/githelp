var request = require('request');
var Q = require('q');
var async = require('async');

exports.auth = function(req, res) {
  res.send(req.isAuthenticated() ? req.user : '0');
};
