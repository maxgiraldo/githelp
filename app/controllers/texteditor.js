// Module dependencies here
var mongoose = require('mongoose'),
    async = require('async'),
    Q = require('q'),
    _ = require('underscore');

exports.upload = function(req, res) {
  var fileName = req.files.file.name;
  var fileType = req.files.file.type;
  res.send(200);
}