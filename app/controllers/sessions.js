// Module dependencies here
var request = require('request');
var mongoose = require('mongoose');
// Specific mongoose models defined here
var Session = mongoose.model('Session');

exports.create = function(){
  var newSession = new Session(req.body);
  newSession.save();
  res.send(200);
}
